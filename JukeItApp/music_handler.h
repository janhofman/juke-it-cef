#ifndef JUKEIT_MUSIC_HANDLER_H_
#define JUKEIT_MUSIC_HANDLER_H_

#include <unordered_map>
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

	//~SqliteHandler() OVERRIDE;

private:
	enum CommandName {
		PLAY,
		PAUSE,
		CLOSE,
		OPEN,

		NOT_SUPPORTED
	};

	CommandName GetCommandName(const std::string& command);	

	const CefString startup_url_;
	MusicPlayer player_;

	DISALLOW_COPY_AND_ASSIGN(MusicHandler);
};
#endif
