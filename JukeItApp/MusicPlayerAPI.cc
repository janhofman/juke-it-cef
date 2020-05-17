#include "MusicPlayerAPI.h"

//------------------------------------------------------------------------------

// Report a failure
void
fail(boost::system::error_code ec, char const* what)
{
	std::cerr << what << ": " << ec.message() << "\n";
}

namespace MusicPlayer {

	const std::string Session::TYPE_REQUEST = "REQUEST";
	const std::string Session::TYPE_RESPONSE = "RESPONSE";

	void Session::Run()
	{
		// Accept the websocket handshake
		ws_.async_accept(boost::asio::bind_executor(strand_, 
			std::bind(&Session::OnAccept, shared_from_this(), std::placeholders::_1)));
	}

	void Session::OnAccept(boost::system::error_code ec)
	{
		if (ec) {
			return fail(ec, "accept");
		}

		// Read a message
		DoRead();
	}

	void Session::DoRead()
	{
		// Read a message into our buffer
		ws_.async_read(buffer_, boost::asio::bind_executor(strand_, 
			std::bind(&Session::OnRead, shared_from_this(), std::placeholders::_1, std::placeholders::_2)));
	}

	void Session::OnRead(boost::system::error_code ec, std::size_t bytes_transferred)
	{
		boost::ignore_unused(bytes_transferred);

		if (ec) {
			// This indicates that the session was closed
			if (ec == websocket::error::closed) {
				OnClose();
				return;
			}
			// this indicates that the read loop was closed 
			else if (ec == boost::asio::error::operation_aborted) {
				return;
			}
			else {
				fail(ec, "read");
			}
		}
		
		std::error_code errCode;

		// read buffer and wipe it after
		std::string message = buffers_to_string(buffer_.data());
		buffer_.consume(buffer_.size());

		auto json = web::json::value::parse(String_t(message), errCode);
		if (errCode.value() == 0 && json.is_object()) {
			auto jsonObj = json.as_object();
			HandleRequest(jsonObj);
		}
		else {
			// TODO: send error back
			failCounter_ += 1;			
		}
		// if there are more than 3 fails in a row, close connection
		if (failCounter_ >= 3) {
			DoClose(boost::beast::websocket::close_code::bad_payload);
			return;
		}
		// send what we have to send
		DoWrite();
		// Do another read
		DoRead();
	}

	void Session::DoWrite() {
		if (writeQueue_.size() > 0 && !writing_) {
			ws_.text(true);
			boost::beast::ostream(writeBuffer_) << writeQueue_.front();
			writeQueue_.pop();
			ws_.async_write(writeBuffer_.data(), boost::asio::bind_executor(strand_, std::bind(&Session::OnWrite, shared_from_this(), std::placeholders::_1, std::placeholders::_2)));
			writing_ = true;
		}
	}

	void Session::OnWrite(boost::system::error_code ec, std::size_t bytes_transferred)
	{
		if (ec.value() == 995) {
			// connection closed
			return;
		}
  
		boost::ignore_unused(bytes_transferred);
		writing_ = false;

		// clear the buffer
		writeBuffer_.consume(writeBuffer_.size());

		// start another write if there is anything to write
		if (writeQueue_.size() > 0) {
			DoWrite();
		}

		if (ec) {
			return fail(ec, "write");
		}
	}

	void Session::OnClose() {
		// reset cache and player
		CloseAction();
		// clear writeQueue so no writes happen on closed connection
		while (writeQueue_.size() > 0) {
			writeQueue_.pop();
		}
		closed_ = true;
	}

	void Session::DoClose(const boost::beast::websocket::close_reason& closeReason) {
		ws_.async_close(closeReason, boost::asio::bind_executor(strand_, [this](boost::system::error_code ec) {
			boost::ignore_unused(ec);
			OnClose();
		}));
	}

	void Session::HandleRequest(const web::json::object& request) {		
		// mark counter at beginning
		std::uint8_t failAtStart = failCounter_;
		ResponseErrorCode rtc = ResponseErrorCode::OK;
		// verify jsonrpc version
		auto versionPtr = request.find(utility::conversions::to_string_t("jsonrpc"));
		auto idPtr = request.find(utility::conversions::to_string_t("id"));
		if (versionPtr != request.end() 
			&& versionPtr->second.is_string() 
			&& utility::conversions::to_utf8string(versionPtr->second.as_string()) == "2.0"
			&& idPtr!= request.end()) {
			// find action
			auto actionPtr = request.find(utility::conversions::to_string_t("method"));
			if (actionPtr != request.end() && actionPtr->second.is_string()) {
				auto actionStr = utility::conversions::to_utf8string(actionPtr->second.as_string());
				ActionEnum action = GetAction(actionStr);
				if (action != ActionEnum::NOT_SUPPORTED) {
					// we have a successful request,
					// handle requests without payload first
					switch (action)
					{
					case Session::PLAY: {
						rtc = PlayAction();
						break;
					}
					case Session::PAUSE: {
						rtc = PauseAction();
						break;
					}
					case Session::NEXT: {
						rtc = NextAction();
						break;
					}
					case Session::RESET: {
						rtc = ResetAction();
						break;
					}
					default: {
						// find payload and handle the rest of actions					
						auto payloadPtr = request.find(utility::conversions::to_string_t("params"));
						if (payloadPtr != request.end()) {
							if (payloadPtr->second.is_object()) {
								auto payload = payloadPtr->second.as_object();
								switch (action)
								{
								case Session::UPDATE_QUEUE: {
									rtc = UpdateQueueAction(payload);
									break;
								}
								case Session::INITIALIZE: {
									rtc = InitializeAction(payload);
									break;
								}
								case Session::VOLUME: {
									rtc = VolumeAction(payload);
									break;
								}
								default:
									// we should not need this as there is no other option left
									rtc = ResponseErrorCode::NOT_SUPPORTED_ACTION;
									failCounter_ += 1;
									break;
								}
							}
						}
						break;
					}
					}
				}
				else {
					rtc = ResponseErrorCode::NOT_SUPPORTED_ACTION;
					failCounter_ += 1;
				}
			}
			else {
				rtc = ResponseErrorCode::MALFORMED_REQUEST;
				failCounter_ += 1;
			}
		}
		else {
			rtc = ResponseErrorCode::MALFORMED_REQUEST;
		}

		SendResponse(rtc, idPtr != request.end() ? idPtr->second : web::json::value::null());

		// same numbers mean successful request, so we reset fail counter
		if (failAtStart == failCounter_) {
			failCounter_ = 0;
		}
	}

	Session::ResponseErrorCode Session::PlayAction() {
		if (cache_.get() != nullptr) {
			bool songOpen = true;
			if (currentSong_.get() == nullptr) {
				try {
					OpenNextSong();
				}
				catch (const SongCache::EmptyQueueException&) {
					// ask for a song
					waitingForQueue_ = true;
					RequestPlaylistSong();
					songOpen = false;
				}
				catch (const SongCache::FileserverDisconnectedException&) {
					// fileserver is not available, we need to reset player and let manager know
					ResetPlayer();
					SendNotification("FILESERVERDISCONNECTED");
					return ResponseErrorCode::FILESERVER_NOT_SET;
				}
			}
			if (!playing_) {
				playing_ = true;
				if (songOpen) {
					player_.Play();
				}
			}
		}
		else {
			return ResponseErrorCode::FILESERVER_NOT_SET;
		}
		return ResponseErrorCode::OK;
	}

	Session::ResponseErrorCode Session::PauseAction() {
		if (cache_.get() != nullptr) {
			player_.Pause();
			playing_ = false;
		}
		else {
			return ResponseErrorCode::FILESERVER_NOT_SET;
		}
		return ResponseErrorCode::OK;
	}

	Session::ResponseErrorCode Session::NextAction() {
		if (cache_.get() != nullptr) {
			bool songOpen = false;
			try {
				OpenNextSong();
				songOpen = true;
			}
			catch (const SongCache::EmptyQueueException&) {
				// ask for a song
				waitingForQueue_ = true;
				RequestPlaylistSong();
			}
			catch (const SongCache::FileserverDisconnectedException&) {
				// fileserver is not available, we need to reset player and let manager know
				ResetPlayer();
				SendNotification("FILESERVERDISCONNECTED");
				return ResponseErrorCode::FILESERVER_NOT_SET;
			}

			if (songOpen && playing_) {
				player_.Play();
			}
		}
		else {
			return ResponseErrorCode::FILESERVER_NOT_SET;
		}
		return ResponseErrorCode::OK;
	}

	Session::ResponseErrorCode Session::ResetAction() {
		ResetPlayer();
		return ResponseErrorCode::OK;
	}

	Session::ResponseErrorCode Session::CloseAction() {
		ResetPlayer();
		return ResponseErrorCode::OK;
	}

	Session::ResponseErrorCode Session::InitializeAction(const web::json::object& payload) {
		auto it = payload.find(String_t("url"));
		if (it != payload.end() && it->second.is_string()) {
			auto url = utility::conversions::to_utf8string(it->second.as_string());
			cache_ = std::make_unique<SongCache>(url);
			if (cache_->TestConnection()) {
				player_.SetPlaybackFinishedCallback(std::bind(&Session::NextAction, this));
				player_.SetStatusCallback(std::bind(&Session::SendStatus, this, std::placeholders::_1, std::placeholders::_2));
				// ask for a song
				RequestPlaylistSong();
			}
			else {
				return ResponseErrorCode::FILESERVER_UNREACHABLE;
			}
		}
		else {
			return ResponseErrorCode::MALFORMED_REQUEST;
		}
		return ResponseErrorCode::OK;
	}

	Session::ResponseErrorCode Session::VolumeAction(const web::json::object& payload) {
		auto it = payload.find(String_t("volume"));
		if (it != payload.end()) {
			if (it->second.is_number()) {
				auto volume = it->second.as_number().to_int32();
				if (volume >= 0 && volume <= 100) {
					player_.SetVolume(volume);
					return ResponseErrorCode::OK;
				}
			}
		}
		// fallback error
		return ResponseErrorCode::MALFORMED_REQUEST;
	}

	Session::ResponseErrorCode Session::UpdateQueueAction(const web::json::object& payload) {
		if (cache_.get() != nullptr) {
			std::vector<SongCache::QueueItem> queue;
			if (TryParseQueue(payload, queue)) {
				// update queue
				cache_->UpdateQueue(queue);

				if (waitingForQueue_) {
					waitingForQueue_ = false;
					NextAction();
				}
				else if(!cache_->HasEnoughSongs()){
					RequestPlaylistSong();
				}
			}
			else {
				return ResponseErrorCode::MALFORMED_REQUEST;
			}
		}
		else {
			return ResponseErrorCode::FILESERVER_NOT_SET;
		}
		return ResponseErrorCode::OK;
	}

	void Session::OpenNextSong() {		
		SongPtr nextSong;
		do {
			try {
				nextSong = cache_->NextSong();
			}
			catch (const SongCache::FailedToLoadSongException& ex) {
				// notify about failed song
				web::json::value payload;
				payload[String_t("itemId")] = web::json::value::string(String_t(ex.itemId()));
				payload[String_t("songId")] = web::json::value::string(String_t(ex.songId()));

				SendNotification("SONGFAILED", payload);
			}
		} while (nextSong.get() == nullptr);

		currentSong_ = nextSong->shared_from_this();
		player_.Open(nextSong->GetStream());

		// notify manager about next song
		web::json::value payload;
		payload[String_t("itemId")] = web::json::value::string(String_t(nextSong->GetItemId()));

		SendNotification("SONGSTARTED", payload);
	}

	bool Session::TryParseQueue(const web::json::object& payload, std::vector<SongCache::QueueItem>& outQueue) {
		auto queueIt = payload.find(String_t("queue"));
		if (queueIt != payload.end() && queueIt->second.is_array()) {
			auto queue = queueIt->second.as_array();
			for (auto item = queue.begin(); item != queue.end(); item++)
			{
				if (item->is_object() && item->has_string_field(String_t("songId")) && item->has_string_field(String_t("itemId"))) {
					SongCache::QueueItem queItem;
					queItem.itemId = utility::conversions::to_utf8string((*item)[String_t("itemId")].as_string());
					queItem.songId = utility::conversions::to_utf8string((*item)[String_t("songId")].as_string());
					outQueue.push_back(queItem);
				}
				else {
					return false;
				}
			}
			return true;
		}
		return false;
	}

	void Session::ResetPlayer() {
		// we only need to take care of situation where the cache has already been initialized
		if (cache_.get() != nullptr) {
			player_.Close();
			playing_ = false;
			currentSong_.reset();
			cache_->Reset(); // reset cache
			cache_.reset();  // reset cache pointer
		}
	}

	void Session::RequestPlaylistSong() {
		if (!cache_->HasEnoughSongs()) {
			SendNotification("REQUESTPLAYLIST");
		}
	}

	void Session::SendStatus(bool playing, int timestamp) {
		web::json::value status;
		status[String_t("timestamp")] = web::json::value::number(timestamp);
		status[String_t("playing")] = web::json::value::boolean(playing);

		SendNotification("STATUS", status);
	}

	Session::ActionEnum Session::GetAction(const std::string& action) {
		if (action == "PLAY") {
			return ActionEnum::PLAY;
		}
		else if (action == "PAUSE") {
			return ActionEnum::PAUSE;
		}
		else if (action == "NEXT") {
			return ActionEnum::NEXT;
		}
		else if (action == "CLOSE") {
			return ActionEnum::CLOSE;
		}
		else if (action == "RESET") {
			return ActionEnum::RESET;
		}
		else if (action == "UPDATEQUEUE") {
			return ActionEnum::UPDATE_QUEUE;
		}
		else if (action == "INITIALIZE") {
			return ActionEnum::INITIALIZE;
		}
		else if (action == "VOLUME") {
			return ActionEnum::VOLUME;
		}
		else if (action == "SEEK") {
			return ActionEnum::SEEK;
		}
		else {
			return ActionEnum::NOT_SUPPORTED;
		}
	}

	void Session::SendResponse
	(Session::ResponseErrorCode responseCode, const web::json::value& id) {
		web::json::value response;
		response[String_t("jsonrpc")] = web::json::value::string(String_t("2.0"));
		response[String_t("id")] = id;

		if (responseCode == ResponseErrorCode::OK) {
			response[String_t("result")] = web::json::value::string(String_t("OK"));
		}
		else {
			web::json::value error;
			error[String_t("code")] = web::json::value::number((int)responseCode);
			error[String_t("message")] = web::json::value::string(String_t(""));

			response[String_t("error")] = error;
		}

		writeQueue_.push(utility::conversions::to_utf8string(response.serialize()));
		DoWrite();
	}

	void Session::SendNotification(const std::string& action) {
		SendNotification(action, web::json::value::object());
	}

	void Session::SendNotification(const std::string& action, const web::json::value& payload) {
		web::json::value request;
		request[String_t("jsonrpc")] = web::json::value::string(String_t("2.0"));
		request[String_t("method")] = web::json::value::string(String_t(action));
		request[String_t("params")] = payload;

		writeQueue_.push(utility::conversions::to_utf8string(request.serialize()));
		DoWrite();
	}/*

	void Session::Error(Session::ResponseErrorCode errCode) {
		web::json::value payload;
		payload[String_t("errorCode")] = web::json::value::number((std::int32_t)errCode);

		SendRequest("ERROR", payload);
	}*/

	Listener::Listener(boost::asio::io_context& ioc,tcp::endpoint endpoint) : acceptor_(ioc), socket_(ioc)
	{
		boost::system::error_code ec;

		// Open the acceptor
		acceptor_.open(endpoint.protocol(), ec);
		if (ec)
		{
			fail(ec, "open");
			return;
		}

		// Allow address reuse
		acceptor_.set_option(boost::asio::socket_base::reuse_address(true), ec);
		if (ec)
		{
			fail(ec, "set_option");
			return;
		}

		// Bind to the server address
		acceptor_.bind(endpoint, ec);
		if (ec)
		{
			fail(ec, "bind");
			return;
		}

		// Start listening for connections
		acceptor_.listen(boost::asio::socket_base::max_listen_connections, ec);
		if (ec)
		{
			fail(ec, "listen");
			return;
		}
	}

	void Listener::Run()
	{
		if (!acceptor_.is_open()) {
			return;
		}
		DoAccept();
	}

	void Listener::DoAccept()
	{
		acceptor_.async_accept(socket_, std::bind(&Listener::OnAccept, shared_from_this(), std::placeholders::_1));
	}

	void Listener::OnAccept(boost::system::error_code ec)
	{
		if (ec == boost::asio::error::operation_aborted) {
			return;
		}

		if (ec) {
			fail(ec, "accept");
			return;
		}
		else
		{
			if (sessionPtr_ == nullptr || sessionPtr_->IsClosed()) {
				// Create the session and run it
				sessionPtr_ = std::make_shared<Session>(std::move(socket_));
				sessionPtr_->Run();
			}
			else {
				RejectConnection();
			}			
		}

		// Accept another connection
		DoAccept();
	}

	void Listener::Close() {
		if (sessionPtr_ != nullptr && !sessionPtr_->IsClosed()) {
			auto reason = websocket::close_reason(websocket::close_code::going_away);
			sessionPtr_->Close(reason);
		}

		// cancel all work on acceptor and close it
		boost::system::error_code ec = boost::asio::error::operation_aborted;
		acceptor_.cancel(ec);
		if (acceptor_.is_open()) {
			acceptor_.close();
		}
	}

	void Listener::RejectConnection() {
		auto ws = std::make_shared<websocket::stream<tcp::socket>>(std::move(socket_));
		ws->async_accept([=](boost::system::error_code ec){
			boost::ignore_unused(ec);
			ws->async_close(websocket::close_code::try_again_later, [=](boost::system::error_code ec) {
				boost::ignore_unused(ec);
				boost::ignore_unused(ws);
			});
		});
	}

	void API::Start(const boost::asio::ip::address &address, std::uint16_t port)
	{
		std::lock_guard<std::mutex> guard(mutex);
		if (!running_) {
			// The io_context is required for all I/O
			ioContext_ = std::make_shared<boost::asio::io_context>(1);

			// Create and launch a listening port
			listener_ = std::make_shared<Listener>(*ioContext_, tcp::endpoint{ address, port });
			listener_->Run();

			// Run the I/O service on new thread
			thread_ = std::make_shared<std::thread>([this] { ioContext_->run(); });

			std::stringstream ss;
			ss << "ws://" << address.to_string() << ':' << port;
			address_ = ss.str();
			running_ = true;
		}		
	}

	void API::Close() {
		std::lock_guard<std::mutex> guard(mutex);
		if (running_) {
			if (listener_.get() != nullptr) {
				listener_->Close();
			}
			if (thread_.get() != nullptr) {
				if (thread_->joinable()) {
					// the thread will join when all work is done
					// that is closing the sockets and acceptor
					thread_->join();
				}
			}

			// cleanup resources - now nothing is running so we can dealloc
			thread_.reset();
			listener_.reset();
			ioContext_.reset();

			address_ = std::string();
			running_ = false;
		}
	}
}