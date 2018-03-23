#ifndef JUKEIT_SQLITE_HANDLER_H_
#define JUKEIT_SQLITE_HANDLER_H_

#include "include/wrapper/cef_message_router.h"
#include "include/cef_base.h"

class SqliteHandler : public CefMessageRouterBrowserSide::Handler {
public:
	SqliteHandler() {}

	virtual bool OnQuery(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id,
		const CefString& request,
		bool persistent,
		CefRefPtr<Callback> callback) OVERRIDE;

	virtual void OnQueryCanceled(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id) OVERRIDE;
private:
	DISALLOW_COPY_AND_ASSIGN(SqliteHandler);
};


#endif
