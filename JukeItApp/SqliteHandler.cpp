#include "SqliteHandler.h"

bool SqliteHandler::OnQuery(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, int64 query_id, const CefString& request, bool persistent, CefRefPtr<Callback> callback) {
	if (request == "my_request") {
		// do some work
		callback->Success("my_response");
		return true;
	}
	return false;  // Not handled.
}

void SqliteHandler::OnQueryCanceled(CefRefPtr<CefBrowser> browser, CefRefPtr<CefFrame> frame, int64 query_id) {}