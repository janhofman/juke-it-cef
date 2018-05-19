#include "music_handler.h"

MusicHandler::MusicHandler(const CefString& startup_url)
	: startup_url_(startup_url) {}

//SqliteHandler::~SqliteHandler() {
//	if (db_handle_) {
//		sqlite3_close_v2(db_handle_);
//	}
//}

MusicHandler::CommandName MusicHandler::GetCommandName(const std::string & command)
{
	if (StartsWith(command, "PLAY")) {
		if (StartsWith(command, "PLAY_OPEN")) {
			return CommandName::OPEN;
		}
		else if (StartsWith(command, "PLAY_PLAY")) {
			return CommandName::PLAY;
		}
		else if (StartsWith(command, "PLAY_PAUSE")) {
			return CommandName::PAUSE;
		}
		else if (StartsWith(command, "PLAY_CLOSE")) {
			return CommandName::CLOSE;
		}
		else {
			return CommandName::NOT_SUPPORTED;
		}
	}
	else {
		return CommandName::NOT_SUPPORTED;
	}
}

// Called due to cefQuery execution in message_router.html.
bool MusicHandler::OnQuery(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	int64 query_id,
	const CefString& request,
	bool persistent,
	CefRefPtr<Callback> callback) {
	// Only handle messages from the startup URL.
	const std::string& url = frame->GetURL();
	if (url.find(startup_url_) != 0)
		return false;

	const std::string& message_name = request;
	CommandName command = GetCommandName(message_name);

	if (command == CommandName::NOT_SUPPORTED) {
		return false;
	}

	switch (command) {
	case CommandName::OPEN: {
		auto params = GetParams(message_name);
		auto itPath = params.find("path");
		if (itPath != params.end()) {
			player_.Open(itPath->second);
			callback->Success("OK");
		}
		else {
			callback->Failure(100, "ERROR");
		}
		return true;
	}
	case CommandName::PLAY: {
		player_.Play();
		callback->Success("OK");
		return true;
	}
	case CommandName::PAUSE: {
		player_.Pause();
		callback->Success("OK");
		return true;
	}
	case CommandName::CLOSE: {
		player_.Close();
		callback->Success("OK");
		return true;
	}

	}
	return false;
}