#include "MsgHandler_MusicPlayer.h"

MsgHandler_MusicPlayer::MsgHandler_MusicPlayer(const CefString& startup_url)
	: startup_url_(startup_url) {
	auto const address = boost::asio::ip::make_address("192.168.0.101");
	auto const port = static_cast<unsigned short>(std::atoi("8080"));
	auto const threads = std::max<int>(1, std::atoi("1"));

	playerApi_.reset(new MusicPlayer::API());
	playerApi_->Start(address, port, threads);
}

MsgHandler_MusicPlayer::~MsgHandler_MusicPlayer() {
	// close server	
	//sqliteAPI_.reset();
}

MsgHandler_MusicPlayer::CommandName MsgHandler_MusicPlayer::GetCommandName(const web::json::value& request)
{
	if (request.is_object()) {
		auto it = request.as_object().find(utility::conversions::to_string_t("command"));

		if (it != request.as_object().end() && it->second.is_string()) {
			std::string command = ToUpperCase(utility::conversions::to_utf8string(it->second.as_string()));

			if (StartsWith(command, "MPL")) {
				if (StartsWith(command, "MPL_OPEN_PLAYER")) {
					return CommandName::OPEN_PLAYER;
				}
				else if (StartsWith(command, "MPL_CLOSE_PLAYER")) {
					return CommandName::CLOSE_PLAYER;
				}
				else {
					return CommandName::NOT_SUPPORTED;
				}
			}
			else {
				return CommandName::NOT_SUPPORTED;
			}
		}
	}
	return CommandName::NOT_SUPPORTED;
}

// Called due to cefQuery execution in message_router.html.
bool MsgHandler_MusicPlayer::OnQuery(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	int64 query_id,
	const CefString& request,
	bool persistent,
	CefRefPtr<Callback> callback) {
	// Only handle messages from the startup URL.
	const std::string& url = frame->GetURL();
	if (url.find(startup_url_) != 0)
		return false;

	const std::string& requestString = request;
	web::json::value requestJSON;
	if (!TryParseJSON(requestString, requestJSON) && !requestJSON.is_object()) {
		return false;
	}
	CommandName command = GetCommandName(requestJSON);

	if (command == CommandName::NOT_SUPPORTED) {
		return false;
	}

	switch (command) {
	case CommandName::OPEN_PLAYER: {
		OpenPlayer(requestJSON, callback);
		return true;
	}
	case CommandName::CLOSE_PLAYER: {
		ClosePlayer(callback);
		return true;
	}
	}
	return false;
}

void MsgHandler_MusicPlayer::OpenPlayer(web::json::value request, CefRefPtr<Callback> callback) {
	
}

void MsgHandler_MusicPlayer::ClosePlayer(CefRefPtr<Callback> callback) {
	//pplx::create_task([=]() {
	//	std::lock_guard<std::mutex> guard(mutex);
	//	if (running_) {
	//		fileserver_->close().then([=](pplx::task<void> t) {
	//			try
	//			{
	//				t.get();
	//				running_ = false;

	//				fileserver_.reset();
	//				fileserver_handler_.reset();

	//				web::json::value response;
	//				response[U("status")] = web::json::value::number(0);

	//				callback->Success(utility::conversions::to_utf8string(response.to_string()));
	//			}
	//			catch (...)
	//			{
	//				callback->Failure(1, "Server failed to close.");
	//			}
	//		}).wait(); // !!! IMPORTANT TO HOLD MUTEX DURING CLOSING
	//	}
	//	else {
	//		web::json::value response;
	//		response[U("status")] = web::json::value::number(0);

	//		callback->Success(utility::conversions::to_utf8string(response.to_string()));
	//	}
	//});
}


