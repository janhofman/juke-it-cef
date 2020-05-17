#ifndef MSG_HANDLER_WEB_LOGGER_H_
#define MSG_HANDLER_WEB_LOGGER_H_

#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates

#include <memory>

#include "spdlog/async.h"
#include "spdlog/sinks/basic_file_sink.h"

#include "abstract_message_handler.h"

class MsgHandler_WebLogger : public AbstractMessageHandler {
public:
	explicit MsgHandler_WebLogger(const CefString& startup_url);

	bool OnQuery(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id,
		const CefString& request,
		bool persistent,
		CefRefPtr<Callback> callback) override;

	~MsgHandler_WebLogger();

private:
	enum CommandName {
		LOG_TRACE,
		LOG_DEBUG,
		LOG_INFO,
		LOG_WARN,
		LOG_ERROR,
		LOG_CRITICAL,

		NOT_SUPPORTED
	};

	enum ReturnCode {
		OK = 0,
		FAILED_TO_OPEN = 1,
		ALREADY_RUNNING = 2,
		BAD_REQUEST = 5,
	};

	CommandName GetCommandName(const web::json::value& request);
	void LogError(web::json::value request, CefRefPtr<Callback> callback);
	void LogDebug(web::json::value request, CefRefPtr<Callback> callback);
	
	const CefString startup_url_;
	std::shared_ptr<spdlog::logger> logger_;

	DISALLOW_COPY_AND_ASSIGN(MsgHandler_WebLogger);
};

#endif