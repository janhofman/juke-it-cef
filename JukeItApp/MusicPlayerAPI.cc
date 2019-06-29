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
		ResetAction();
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
		// find action
		auto actionPtr = request.find(utility::conversions::to_string_t("action"));
		if (actionPtr != request.end() && actionPtr->second.is_string()) {
			auto actionStr = utility::conversions::to_utf8string(actionPtr->second.as_string());
			ActionEnum action = GetAction(actionStr);
			if (action != ActionEnum::NOT_SUPPORTED) {
				// we have a successful request,

				// handle requests without payload first
				switch (action)
				{
				case Session::PLAY: {			
					PlayAction();
					break; 
				}
				case Session::PAUSE: {
					PauseAction();
					break;
				}
				case Session::NEXT: {
					NextAction();
					break;
				}
				case Session::RESET: {
					ResetAction();
					break;
				}
				default: {
					// find payload and handle the rest of actions					
					auto payloadPtr = request.find(utility::conversions::to_string_t("payload"));
					if (payloadPtr != request.end()) {
						if (payloadPtr->second.is_object()) {
							auto payload = payloadPtr->second.as_object();
							switch (action)
							{
							case Session::ADD_ORDER: {
								AddOrderAction(payload);
								break;
							}
							case Session::ADD_PLAYLIST: {
								AddPlaylistAction(payload);
								break;
							}
							case Session::FILESERVER: {
								FileServerAction(payload);
								break;
							}
							/*case Session::SEEK: {
								response = SeekAction(payload);
								break;
							}*/
							case Session::VOLUME: {
								VolumeAction(payload);
								break;
							}
							default:
								// we should not need this as there is no other option left
								Error(ResponseErrorCode::NOT_SUPPORTED_ACTION);
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
				Error(ResponseErrorCode::NOT_SUPPORTED_ACTION);
				failCounter_ += 1;
			}
		}
		else {
			Error(ResponseErrorCode::MALFORMED_REQUEST);
			failCounter_ += 1;
		}
		// same numbers mean successful request, so we reset fail counter
		if (failAtStart == failCounter_) {
			failCounter_ = 0;
		}
	}

	void Session::PlayAction() {
		if (cache_.get() != nullptr) {
			if (currentSong_.get() == nullptr) {
				try {
					OpenNextSong();
				}
				catch (...) {
					// ask for a song
					Error(ResponseErrorCode::EMPTY_QUEUES);
					return;
				}
			}
			if (!playing_) {
				playing_ = true;
				player_.Play();
			}
		}
		else {
			Error(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	void Session::PauseAction() {
		if (cache_.get() != nullptr) {
			player_.Pause();
			playing_ = false;
		}
		else {
			Error(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	void Session::NextAction() {
		if (cache_.get() != nullptr) {
			try {
				OpenNextSong();
				if (playing_) {
					player_.Play();
				}
				if (!cache_->HasEnoughSongs()) {
					RequestPlaylistSong();
				}
			}
			catch (...) {
				// ask for a song
				Error(ResponseErrorCode::EMPTY_QUEUES);
			}
		}
		else {
			Error(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	void Session::ResetAction() {
		// we only need to take care of situation where the cache has already been initialized
		if (cache_.get() != nullptr) {
			player_.Close();
			playing_ = false;
			currentSong_.reset();
			cache_->Reset();
		}
	}

	void Session::FileServerAction(const web::json::object& payload) {
		auto it = payload.find(String_t("url"));
		if (it != payload.end()) {
			if (it->second.is_string()) {
				auto url = utility::conversions::to_utf8string(it->second.as_string());
				cache_ = std::make_unique<SongCache>(url);
				player_.SetPlaybackFinishedCallback(std::bind(&Session::NextAction, this));
				player_.SetStatusCallback(std::bind(&Session::SendStatus, this, std::placeholders::_1, std::placeholders::_2));
				// ask for a song
				RequestPlaylistSong();
			}	
		}
		else {
			Error(ResponseErrorCode::MALFORMED_REQUEST);
		}		
	}

	void Session::VolumeAction(const web::json::object& payload) {
		auto it = payload.find(String_t("volume"));
		if (it != payload.end()) {
			if (it->second.is_number()) {
				auto volume = it->second.as_number().to_int32();
				if (volume >= 0 && volume <= 100) {
					player_.SetVolume(volume);
					return;
				}
			}
		}
		// fallback error
		Error(ResponseErrorCode::MALFORMED_REQUEST);
	}

	void Session::AddOrderAction(const web::json::object& payload) {
		if (cache_.get() != nullptr) {
			std::string songId;
			std::string itemId;
			if (TryParseAddAction(payload, songId, itemId)) {
				// add to queue
				cache_->AddToOrderQueue(songId, itemId);
			}
			else {
				Error(ResponseErrorCode::MALFORMED_REQUEST);
			}
		}
		else {
			Error(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	void Session::AddPlaylistAction(const web::json::object& payload) {
		if (cache_.get() != nullptr) {
			std::string songId;
			std::string itemId;
			if (TryParseAddAction(payload, songId, itemId)) {
				// add to queue
				cache_->AddToPlaylistQueue(songId, itemId);
				// request another song if we're still short
				if (!cache_->HasEnoughSongs()) {
					RequestPlaylistSong();
				}
			}
			else {
				Error(ResponseErrorCode::MALFORMED_REQUEST);
			}
		}
		else {
			Error(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	void Session::OpenNextSong() {		
		SongPtr nextSong;
		do {
			nextSong = cache_->NextSong();
		} while (nextSong.get() == nullptr || nextSong->IsFailed());

		currentSong_ = nextSong->shared_from_this();
		player_.Open(nextSong->GetStream());

		// notify manager about next song
		web::json::value payload;
		payload[String_t("itemId")] = web::json::value::string(String_t(nextSong->GetItemId()));

		SendRequest("SONGSTARTED", payload);
	}

	bool Session::TryParseAddAction(const web::json::object& payload, std::string& outSongId, std::string& outItemId) {
		auto it = payload.find(String_t("songId"));
		if (it != payload.end() && it->second.is_string()) {
			outSongId = utility::conversions::to_utf8string(it->second.as_string());

			it = payload.find(String_t("itemId"));
			if (it != payload.end() && it->second.is_string()) {
				outItemId = utility::conversions::to_utf8string(it->second.as_string());

				return true;
			}
		}
		return false;
	}

	void Session::RequestPlaylistSong() {
		if (!cache_->HasEnoughSongs()) {
			SendRequest("REQUESTPLAYLIST");
		}
	}

	void Session::SendStatus(bool playing, int timestamp) {
		web::json::value status;
		status[String_t("timestamp")] = web::json::value::number(timestamp);
		status[String_t("playing")] = web::json::value::boolean(playing);

		SendRequest("STATUS", status);
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
		else if (action == "RESET") {
			return ActionEnum::RESET;
		}
		else if (action == "ADDORDER") {
			return ActionEnum::ADD_ORDER;
		}
		else if (action == "ADDPLAYLIST") {
			return ActionEnum::ADD_PLAYLIST;
		}
		else if (action == "FILESERVER") {
			return ActionEnum::FILESERVER;
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

	void Session::SendRequest(const std::string& action) {
		SendRequest(action, web::json::value::object());
	}

	void Session::SendRequest(const std::string& action, const web::json::value& payload) {
		web::json::value request;
		request[String_t("action")] = web::json::value::string(String_t(action));
		request[String_t("payload")] = payload;

		writeQueue_.push(utility::conversions::to_utf8string(request.serialize()));
		DoWrite();
	}

	void Session::Error(Session::ResponseErrorCode errCode) {
		web::json::value payload;
		payload[String_t("errorCode")] = web::json::value::number((std::int32_t)errCode);

		SendRequest("ERROR", payload);
	}

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