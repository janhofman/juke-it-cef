#include "music_handler.h"

MusicHandler::MusicHandler(const CefString& startup_url)
	: startup_url_(startup_url) {}

MusicHandler::CommandName MusicHandler::GetCommandName(const std::string & command)
{
	if (StartsWith(command, "PLAY")) {
		if (StartsWith(command, "PLAY_OPEN")) {
			return CommandName::OPEN;
		}
		// must come before PLAY because of common prefix
		else if (StartsWith(command, "PLAY_PLAYBACK_FINISHED")) {
			return CommandName::PLAYBACK_FINISHED;
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
		else if (StartsWith(command, "PLAY_TIME_UPDATE")) {
			return CommandName::TIME_UPDATE;
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
	case CommandName::TIME_UPDATE: {
		if (persistent) {
			timeUpdateCallback_ = callback;
			timeUpdateQueryId_ = query_id;
			player_.SetTimeUpdateCallback(std::bind(&MusicHandler::OnTimeUpdate, this, std::placeholders::_1));
		}
		return true;
	}
	case CommandName::PLAYBACK_FINISHED: {
		if (persistent) {
			playbackFinishedCallback_ = callback;
			playbackFinishedQueryId_ = query_id;
			player_.SetPlaybackFinishedCallback(std::bind(&MusicHandler::OnPlaybackFinished, this));
		}
		return true;
	}

	}
	return false;
}

void MusicHandler::OnTimeUpdate(int millis) {
	if (timeUpdateCallback_ != NULL) {
		std::stringstream ss;
		ss << '{';
		AppendJSONInt(ss, "time", millis);
		ss << '}';
		timeUpdateCallback_->Success(ss.str());
	}
}

void MusicHandler::OnPlaybackFinished() {
	if (playbackFinishedCallback_ != NULL) {		
		playbackFinishedCallback_->Success(std::string());
	}
}

void MusicHandler::OnQueryCanceled(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	int64 query_id) {
	if (query_id == timeUpdateQueryId_) {
		timeUpdateCallback_ = NULL;
		player_.SetTimeUpdateCallback(nullptr);
	}
	else if (query_id == playbackFinishedQueryId_) {
		playbackFinishedCallback_ = NULL;
		player_.SetPlaybackFinishedCallback(nullptr);
	}
}