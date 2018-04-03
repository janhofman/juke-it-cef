#ifndef JUKEIT_SQLITE_HANDLER_H_
#define JUKEIT_SQLITE_HANDLER_H_

#include "include/wrapper/cef_helpers.h"
#include "include/wrapper/cef_message_router.h"
extern "C" {
	#include "sqlite3/include/sqlite3.h"
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

	~SqliteHandler() OVERRIDE;

private:
	enum CommandName {
		LOAD_GENRES, NOT_SUPPORTED
	};

	CommandName GetCommandName(const std::string& command);
	std::string LoadGenres();

	static bool startsWith(const std::string& s, const std::string& prefix);

	const CefString startup_url_;
	sqlite3* db_handle_;
	static const char * DATABASE_NAME_;
	static const char QUOTES;

	DISALLOW_COPY_AND_ASSIGN(SqliteHandler);
};
#endif
