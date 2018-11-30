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

		// This indicates that the session was closed
		if (ec == websocket::error::closed) {
			return;
		}

		if (ec) {
			fail(ec, "read");
		}
		
		std::error_code errCode;

		// read buffer and wipe it after
		std::string message = buffers_to_string(buffer_.data());
		buffer_.consume(buffer_.size());

		auto json = web::json::value::parse(String_t(message), errCode);
		if (errCode.value() == 0 && json.is_object()) {
			auto jsonObj = json.as_object();
			auto typePtr = jsonObj.find(utility::conversions::to_string_t("type"));
			if (typePtr != jsonObj.end() && typePtr->second.is_string()) {					
				std::string type = utility::conversions::to_utf8string(typePtr->second.as_string());
				auto bodyPtr = jsonObj.find(utility::conversions::to_string_t("body"));
				if (bodyPtr != jsonObj.end() && bodyPtr->second.is_object()) {
					if (type == TYPE_REQUEST) {
						HandleRequest(bodyPtr->second);
					}
					else if (type == TYPE_RESPONSE) {
						HandleResponse(bodyPtr->second);
					}
					else {
						// TODO: return error
					}
				}
				else {
					// TODO: return error
				}
				
			}
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

	void Session::HandleRequest(const web::json::value& body) {
		auto request = body.as_object();
		web::json::value response;
		// find action
		auto actionPtr = request.find(utility::conversions::to_string_t("action"));
		if (actionPtr != request.end() && actionPtr->second.is_string()) {
			auto actionStr = utility::conversions::to_utf8string(actionPtr->second.as_string());
			ActionEnum action = GetAction(actionStr);
			if (action != ActionEnum::NOT_SUPPORTED) {
				// handle requests without payload first
				switch (action)
				{
				case Session::PLAY: {
					// TODO: start playing
					//auto path = std::string("http://localhost:26331/api/v1/download/songs/");					
					response = PlayAction();
					break; 
				}
				case Session::PAUSE: {
					response = PauseAction();
					break;
				}
				case Session::NEXT: {
					response = NextAction();
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
								response = FileServerAction(payload);
								break;
							}
							/*case Session::SEEK: {
								response = SeekAction(payload);
								break;
							}
							case Session::VOLUME: {
								response = VolumeAction(payload);
								break;
							}*/
							default:
								// we should not need this as there is no other option left
								response = CreateResponse(ResponseErrorCode::NOT_SUPPORTED_ACTION);
								break;
							}
						}
					}
					break;
				}					
				}
			}
			else {
				response = CreateResponse(ResponseErrorCode::NOT_SUPPORTED_ACTION);
			}
		}
		writeQueue_.push(utility::conversions::to_utf8string(response.serialize()));
	}

	void Session::HandleResponse(const web::json::value& body) {

	}

	web::json::value Session::PlayAction() {
		if (cache_.get() != nullptr) {
			if (currentSong_.get() == nullptr) {
				try {
					SongPtr nextSong;
					do {
						nextSong = cache_->NextSong();
					} while (nextSong.get() == nullptr || nextSong->IsFailed());

					currentSong_ = nextSong->shared_from_this();
					player_.Open(nextSong->GetStream());
				}
				catch (...) {
					// ask for a song
					RequestPlaylistSong();
					// TODO: handle NextSong exception if empty queues
					return CreateResponse(ResponseErrorCode::EMPTY_QUEUES);
				}
			}

			if (!playing_) {
				playing_ = true;
				player_.Play();
			}

			return CreateResponse(ResponseErrorCode::OK);
		}
		else {
			return CreateResponse(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	web::json::value Session::PauseAction() {
		if (cache_.get() != nullptr) {
			player_.Pause();
			playing_ = false;
			return CreateResponse(ResponseErrorCode::OK);
		}
		else {
			return CreateResponse(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	web::json::value Session::NextAction() {
		if (cache_.get() != nullptr) {
			try {
				SongPtr nextSong;
				do {
					nextSong = cache_->NextSong();
				} while (nextSong.get() == nullptr || nextSong->IsFailed());

				currentSong_ = nextSong->shared_from_this();
				player_.Open(nextSong->GetStream());
				if (playing_) {
					player_.Play();
				}
			}
			catch (...) {
				// ask for a song
				RequestPlaylistSong();
				// TODO: handle NextSong exception if empty queues
				return CreateResponse(ResponseErrorCode::EMPTY_QUEUES);
			}

			return CreateResponse(ResponseErrorCode::OK);
		}
		else {
			return CreateResponse(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	web::json::value Session::FileServerAction(const web::json::object& payload) {
		auto it = payload.find(String_t("url"));
		if (it != payload.end()) {
			if (it->second.is_string()) {
				auto url = utility::conversions::to_utf8string(it->second.as_string());
				cache_ = std::make_unique<SongCache>(url);
				player_.SetPlaybackFinishedCallback(std::bind(&Session::NextAction, this));
				// ask for a song
				RequestPlaylistSong();

				return CreateResponse(ResponseErrorCode::OK);
			}	
		}
		return CreateResponse(ResponseErrorCode::MALFORMED_REQUEST);
	}

	web::json::value Session::AddOrderAction(const web::json::object& payload) {
		if (cache_.get() != nullptr) {
			std::string songId;
			std::string itemId;
			if (TryParseAddAction(payload, songId, itemId)) {
				// add to queue
				cache_->AddToOrderQueue(songId, itemId);

				return CreateResponse(ResponseErrorCode::OK);
			}
			else {
				return CreateResponse(ResponseErrorCode::MALFORMED_REQUEST);
			}
		}
		else {
			return CreateResponse(ResponseErrorCode::FILESERVER_NOT_SET);
		}
	}

	web::json::value Session::AddPlaylistAction(const web::json::object& payload) {
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

				return CreateResponse(ResponseErrorCode::OK);
			}
			else {
				return CreateResponse(ResponseErrorCode::MALFORMED_REQUEST);
			}
		}
		else {
			return CreateResponse(ResponseErrorCode::FILESERVER_NOT_SET);
		}
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
			web::json::value body;
			body[String_t("action")] = web::json::value::string(String_t("REQUESTPLAYLIST"));

			web::json::value request;
			request[String_t("type")] = web::json::value::string(String_t(TYPE_REQUEST));
			request[String_t("body")] = body;

			writeQueue_.push(utility::conversions::to_utf8string(request.serialize()));
		}
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

	web::json::value Session::CreateResponse(Session::ResponseErrorCode code) {
		return CreateResponse(code, web::json::value::object());
	}

	web::json::value Session::CreateResponse(Session::ResponseErrorCode code, const web::json::value& response) {		
		web::json::value body;
		body[String_t("errorCode")] = web::json::value::number((std::uint32_t)code);
		body[String_t("response")] = response;

		web::json::value obj;
		obj[String_t("type")] = web::json::value::string(String_t(TYPE_RESPONSE));
		obj[String_t("body")] = body;

		return obj;
	}

	void SongCacheItem::MakeReady() {
		ready_ = true;
		auto& vct = asyncBuffer_.collection(); 
		is_ = std::make_unique<boost::interprocess::basic_bufferstream<std::uint8_t>>(vct.data(), vct.size());
	}

	void SongCache::GetSongAsync(const std::string& songId, SongPtr songPtr) {
		// create a task that gets a song and sets it to ready state once it's downloaded
		auto path = String_t("/" + songId);
		auto task = httpClient_.request(web::http::methods::GET, path)
			.then([=](web::http::http_response response) {
			if (response.status_code() == web::http::status_codes::OK) {
				return response.body().read_to_end(songPtr->GetBuffer());
			}
			else {
				// TODO: throw an exception
				throw (int)response.status_code();
			}
		}).then([=](pplx::task<size_t> t) {
			try {
				// call get to verify that the download was successful
				/*auto bytesRead = */t.get();

				// set song ready as it would throw otherwise
				songPtr->MakeReady();
			}
			catch (...) {
				songPtr->Fail();
			}
		});
	}

	SongPtr SongCache::NextSong() {
		// first check if we have ready a song in order queue
		if (orderQueue_.size() > 0) {
			auto item = orderQueue_[0];
			auto it = cache_.find(item.itemId);
			if (it != cache_.end()) {
				if (it->second->IsReady()) {
					// hold the pointer and remove it from cache
					auto songPtr = it->second->shared_from_this();
					cache_.erase(item.itemId);
					// remove it from queue
					orderQueue_.erase(orderQueue_.begin());
					// load next song if there is any
					if (orderQueue_.size() >= 2) {
						AddToCache(orderQueue_[1].songId, orderQueue_[1].itemId);
					}
					// return the pointer
					return songPtr;
				}
				// else: orderQueue top is not ready, so we fallback to playlist queue
			}
			else {
				// we didn't find the song in cache. This should not happen, but if it occurs, we just put it there
				AddToCache(item.songId, item.itemId);
			}
		}
		// song in order queue wasn't available, so we play from playlist queue
		if (playlistQueue_.size() > 0) {
			auto item = playlistQueue_[0];
			auto it = cache_.find(item.itemId);
			if (it != cache_.end()) {
				if (it->second->IsReady()) {
					// hold the pointer and remove it from cache
					auto songPtr = it->second->shared_from_this();
					cache_.erase(item.itemId);
					// remove it from queue
					playlistQueue_.erase(playlistQueue_.begin());
					// load next song if there is any
					if (playlistQueue_.size() >= 2) {
						AddToCache(playlistQueue_[1].songId, playlistQueue_[1].itemId);
					}
					// return the pointer
					return songPtr;
				}
				else {
					// we don't have any song ready, we must wait for it to get buffered
					std::this_thread::sleep_for(std::chrono::seconds(1));
					return NextSong();
				}				
			}
			else {
				// we didn't find the song in cache. This should not happen, but if it occurs, we just put it there
				AddToCache(item.songId, item.itemId);
				// call ourselves recursively, this time the first item is available in cache
				return NextSong();
			}
		}
		// TODO: both queues are empty, throw an exception
		throw 123;
	}

	void SongCache::AddToOrderQueue(const std::string& songId, const std::string& itemId) {
		QueueItem q;
		q.songId = songId;
		q.itemId = itemId;

		// if there are less than 2 items in the order queue, we should load it right away
		bool shouldLoad = orderQueue_.size() < 2;
		orderQueue_.push_back(q);
		if (shouldLoad) {
			AddToCache(songId, itemId);
		}
	}

	void SongCache::AddToPlaylistQueue(const std::string& songId, const std::string& itemId) {
		QueueItem q;
		q.songId = songId;
		q.itemId = itemId;

		// if there are less than 2 items in the order queue, we should load it right away
		bool shouldLoad = playlistQueue_.size() < 2;
		playlistQueue_.push_back(q);
		if (shouldLoad) {
			AddToCache(songId, itemId);
		}
	}

	void SongCache::AddToCache(const std::string& songId, const std::string& itemId) {
		// first make sure the song isn't there already, find is O(1) so it's cheap safety measure
		if (cache_.find(itemId) == cache_.end()) {
			// create a ptr in cache
			SongPtr ptr = std::make_shared<SongCacheItem>(itemId);
			cache_[itemId] = ptr->shared_from_this();
			// fill the ptr
			GetSongAsync(songId, ptr->shared_from_this());
		}
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
		if (ec) {
			fail(ec, "accept");
		}
		else
		{
			// Create the session and run it
			std::make_shared<Session>(std::move(socket_))->Run();
		}

		// Accept another connection
		DoAccept();
	}

	void API::Start(const boost::asio::ip::address &address, std::uint16_t port, std::uint32_t threads)
	{
		// The io_context is required for all I/O
		ioContext_ = std::make_shared<boost::asio::io_context>(threads);

		// Create and launch a listening port
		listener_ = std::make_shared<Listener>(*ioContext_, tcp::endpoint{ address, port });
		listener_->Run();

		// Run the I/O service on the requested number of threads
		threadpool_.reserve(threads);
		for (auto i = threads; i > 0; --i) {
			threadpool_.emplace_back([this] { ioContext_->run(); });
		}
	}


	//------------------------------------------------------------------------------

	//int main(int argc, char* argv[])
	//{
	//	// Check command line arguments.
	//	if (argc != 4)
	//	{
	//		std::cerr <<
	//			"Usage: websocket-server-async <address> <port> <threads>\n" <<
	//			"Example:\n" <<
	//			"    websocket-server-async 0.0.0.0 8080 1\n";
	//		return EXIT_FAILURE;
	//	}
	//	auto const address = boost::asio::ip::make_address(argv[1]);
	//	auto const port = static_cast<unsigned short>(std::atoi(argv[2]));
	//	auto const threads = std::max<int>(1, std::atoi(argv[3]));
	//
	//	// The io_context is required for all I/O
	//	boost::asio::io_context ioc{ threads };
	//
	//	// Create and launch a listening port
	//	std::make_shared<listener>(ioc, tcp::endpoint{ address, port })->run();
	//
	//	// Run the I/O service on the requested number of threads
	//	std::vector<std::thread> v;
	//	v.reserve(threads - 1);
	//	for (auto i = threads - 1; i > 0; --i)
	//		v.emplace_back(
	//			[&ioc]
	//	{
	//		ioc.run();
	//	});
	//	ioc.run();
	//
	//	return EXIT_SUCCESS;
	//}
}