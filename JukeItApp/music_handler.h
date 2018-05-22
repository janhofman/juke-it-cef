#ifndef JUKEIT_MUSIC_HANDLER_H_
#define JUKEIT_MUSIC_HANDLER_H_

#include <unordered_map>
#include <functional>
#include <sstream>
#include "abstract_message_handler.h"

#include "MusicPlayer.h"

class MusicHandler : public AbstractMessageHandler {
public:
	explicit MusicHandler(const CefString& startup_url);

	bool OnQuery(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id,
		const CefString& request,
		bool persistent,
		CefRefPtr<Callback> callback) OVERRIDE;

	void OnQueryCanceled(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id) OVERRIDE;

	//~SqliteHandler() OVERRIDE;

private:
	enum CommandName {
		PLAY,
		PAUSE,
		CLOSE,
		OPEN,
		TIME_UPDATE,

		NOT_SUPPORTED
	};

	CommandName GetCommandName(const std::string& command);	
	void OnTimeUpdate(int millis);

	const CefString startup_url_;
	MusicPlayer player_;
	CefRefPtr<Callback> timeUpdateCallback_ = NULL;
	int64 timeUpdateQueryId_ = -1;

	DISALLOW_COPY_AND_ASSIGN(MusicHandler);
};
#endif
