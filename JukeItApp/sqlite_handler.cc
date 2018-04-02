#include "sqlite_handler.h"

SqliteHandler::SqliteHandler(const CefString& startup_url)
	: startup_url_(startup_url) {}

	// Called due to cefQuery execution in message_router.html.
bool SqliteHandler::OnQuery(CefRefPtr<CefBrowser> browser,
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
	if (message_name.find("ciaoC++") == 0) {
		// Reverse the string and return.
		std::string result = std::string("Ciao, JavaScript!");
		callback->Success(result);
		auto rtc = sqlite3_open("data.dat", &sqlite_handle_);
		return true;
	}
	return false;
}