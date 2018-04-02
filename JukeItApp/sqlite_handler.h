#ifndef JUKEIT_SQLITE_HANDLER_H_
#define JUKEIT_SQLITE_HANDLER_H_

#include "include/wrapper/cef_helpers.h"
#include "include/wrapper/cef_message_router.h"
extern "C" {
	#include "sqlite3\sqlite3.h"
}


class SqliteHandler : public CefMessageRouterBrowserSide::Handler {
public:
	explicit SqliteHandler(const CefString& startup_url);

	bool OnQuery(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id,
		const CefString& request,
		bool persistent,
		CefRefPtr<Callback> callback) OVERRIDE;

private:
	const CefString startup_url_;
	sqlite3* sqlite_handle_;

	DISALLOW_COPY_AND_ASSIGN(SqliteHandler);
};
#endif
