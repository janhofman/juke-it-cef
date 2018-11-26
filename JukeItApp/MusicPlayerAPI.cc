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

		auto json = web::json::value::parse(utility::conversions::to_string_t(message));
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
		// Do another read
		DoRead();
	}

	void Session::OnWrite(boost::system::error_code ec, std::size_t bytes_transferred)
	{
		boost::ignore_unused(bytes_transferred);

		// clear the buffer
		buffer_.consume(buffer_.size());

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
					auto path = std::string("http://localhost:26331/api/v1/download/songs/");
					auto client = web::http::client::http_client(String_t(path));
					client.request(web::http::methods::GET, String_t("/1"))
						.then([=](web::http::http_response response)
					{
						auto ptr = std::make_shared<AsyncBuffer>();
						queue_.push(ptr);
						return response.body().read_to_end(*ptr);
					}).then([=](pplx::task<size_t> t) {
						try {
							auto bytesRead = t.get();
							std::cerr << bytesRead;
						}
						catch (...) {
							// TODO:error
						}
					});
					player_.Open(path);
					player_.Play();
					response = CreateResponse(ResponseErrorCode::OK);
					break; 
				}
				default: {
					// find payload and handle the rest of actions
					web::json::value payload = web::json::value::null();
					auto payloadPtr = request.find(utility::conversions::to_string_t("payload"));
					if (payloadPtr != request.end()) {
						if (payloadPtr->second.is_object()) {
							/*switch (action)
							{
							default:
								break;
							}*/
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
		ws_.text(ws_.got_text());		
		boost::beast::ostream(buffer_) << utility::conversions::to_utf8string(response.serialize());
		ws_.async_write(buffer_.data(), boost::asio::bind_executor(strand_, std::bind(&Session::OnWrite, shared_from_this(), std::placeholders::_1, std::placeholders::_2)));
	}

	void Session::HandleResponse(const web::json::value& body) {

	}

	Session::ActionEnum Session::GetAction(const std::string& action) {
		if (action == "PLAY") {
			return ActionEnum::PLAY;
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