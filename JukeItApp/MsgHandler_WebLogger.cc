#include "MsgHandler_WebLogger.h"

MsgHandler_WebLogger::MsgHandler_WebLogger(const CefString& startup_url)
	: startup_url_(startup_url) {
	logger_ = spdlog::create_async<spdlog::sinks::basic_file_sink_mt>("web_logger", "logs/web_log.txt");
	logger_->flush_on(spdlog::level::err);
}

MsgHandler_WebLogger::~MsgHandler_WebLogger() {}

MsgHandler_WebLogger::CommandName MsgHandler_WebLogger::GetCommandName(const web::json::value& request)
{
	if (request.is_object()) {
		auto it = request.as_object().find(utility::conversions::to_string_t("command"));

		if (it != request.as_object().end() && it->second.is_string()) {
			std::string command = ToUpperCase(utility::conversions::to_utf8string(it->second.as_string()));

			if (StartsWith(command, "LOG")) {
				if (StartsWith(command, "LOG_TRACE")) {
					return CommandName::LOG_TRACE;
				}
				else if (StartsWith(command, "LOG_DEBUG")) {
					return CommandName::LOG_DEBUG;
				}
				else if (StartsWith(command, "LOG_INFO")) {
					return CommandName::LOG_INFO;
				}
				else if (StartsWith(command, "LOG_WARN")) {
					return CommandName::LOG_WARN;
				}
				else if (StartsWith(command, "LOG_ERROR")) {
					return CommandName::LOG_ERROR;
				}
				else if (StartsWith(command, "LOG_CRITICAL")) {
					return CommandName::LOG_CRITICAL;
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
bool MsgHandler_WebLogger::OnQuery(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	int64 query_id,
	const CefString& request,
	bool persistent,
	CefRefPtr<Callback> callback) {
	// Only handle messages from the startup URL.
	/*const std::string& url = frame->GetURL();
	if (url.find(startup_url_) != 0)
		return false;*/

	const std::string& requestString = request;
	web::json::value requestJSON;
	if (!TryParseJSON(requestString, requestJSON) && !requestJSON.is_object()) {
		return false;
	}
	CommandName command = GetCommandName(requestJSON);

	switch (command) {
	case CommandName::LOG_ERROR: {
		LogError(requestJSON, callback);
		return true;
	}
	case CommandName::LOG_DEBUG: {
		LogDebug(requestJSON, callback);
		return true;
	}
	default: 
		return false;
	}
	return false;
}

void MsgHandler_WebLogger::LogError(web::json::value request, CefRefPtr<Callback> callback) {	
	if (request.is_object()) {		
		auto messageIt = request.as_object().find(utility::conversions::to_string_t("payload"));
		if (messageIt != request.as_object().end()) {
			auto message = utility::conversions::to_utf8string(messageIt->second.serialize());

			logger_->error(message);

			callback->Success(utility::conversions::to_utf8string("OK"));
		}
	}
	callback->Failure(ReturnCode::BAD_REQUEST, "Malformed request");
	return;
}

void MsgHandler_WebLogger::LogDebug(web::json::value request, CefRefPtr<Callback> callback) {
	if (request.is_object()) {
		auto messageIt = request.as_object().find(utility::conversions::to_string_t("payload"));
		if (messageIt != request.as_object().end() && messageIt->second.is_string()) {
			auto message = utility::conversions::to_utf8string(messageIt->second.as_string());

			logger_->debug(message);

			callback->Success(utility::conversions::to_utf8string("OK"));
		}
	}
	callback->Failure(ReturnCode::BAD_REQUEST, "Malformed request");
	return;
}


