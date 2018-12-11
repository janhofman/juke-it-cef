#include "MsgHandler_MusicPlayer.h"

MsgHandler_MusicPlayer::MsgHandler_MusicPlayer(const CefString& startup_url)
	: startup_url_(startup_url) {
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
	if (playerApi_.get() != nullptr) {
		if (playerApi_->IsRunning()) {
			// TODO: either call failure or call Success, but we need to let JS know bout this, should not occur though
			auto errMsg = "Server is already running on address " + playerApi_->GetAddress();
			callback->Failure(35, errMsg);
			return;
		}
	}
	if (request.is_object()) {
		std::string ipAddress = "localhost";
		std::uint16_t port = 26341; // default
		auto payloadIt = request.as_object().find(utility::conversions::to_string_t("payload"));
		if (payloadIt != request.as_object().end() && payloadIt->second.is_object()) {
			auto payload = payloadIt->second.as_object();

			auto ipAddressIt = payload.find(utility::conversions::to_string_t("ipAddress"));
			if (ipAddressIt != payload.end() && ipAddressIt->second.is_string()) {
				ipAddress = utility::conversions::to_utf8string(ipAddressIt->second.as_string());
			}

			auto portIt = payload.find(utility::conversions::to_string_t("port"));
			if (portIt != payload.end() && portIt->second.is_number()) {
				auto num = portIt->second.as_integer();
				if (num > 0 && num < 65536) {
					port = (std::uint16_t)num;
				}
				else {
					callback->Failure(12, "port is outside of port value range 1 - 65535");
					return;
				}				
			}
			// start connection
			boost::asio::ip::address address;
			if (ipAddress == "localhost") {
				address = boost::asio::ip::address_v4::loopback();
			}
			else {
				address = boost::asio::ip::make_address(ipAddress);
			}

			if (playerApi_.get() == nullptr) {
				playerApi_.reset(new MusicPlayer::API());
			}			
			playerApi_->Start(address, port);

			web::json::value response;
			response[utility::conversions::to_string_t("status")] = web::json::value::number(0);			
			response[utility::conversions::to_string_t("address")] = web::json::value::string(utility::conversions::to_string_t(playerApi_->GetAddress()));

			callback->Success(utility::conversions::to_utf8string(response.to_string()));
		}
	}
	callback->Failure(12, "Malformed request");
	return;
}

void MsgHandler_MusicPlayer::ClosePlayer(CefRefPtr<Callback> callback) {
	if (playerApi_.get() != nullptr) {
		if (playerApi_->IsRunning()) {
			playerApi_->Close();
			// we want to free the api since the server isn't running and it would just eat up memory
			playerApi_.reset();
		}
	}

	web::json::value response;
	response[utility::conversions::to_string_t("status")] = web::json::value::number(0);
	callback->Success(utility::conversions::to_utf8string(response.to_string()));
}


