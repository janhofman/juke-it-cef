#ifndef MSG_HANDLER_MUSIC_PLAYER_H_
#define MSG_HANDLER_MUSIC_PLAYER_H_

#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates

#include <memory>

#include "abstract_message_handler.h"
#include "MusicPlayerAPI.h"

class MsgHandler_MusicPlayer : public AbstractMessageHandler {
public:
	explicit MsgHandler_MusicPlayer(const CefString& startup_url);

	bool OnQuery(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id,
		const CefString& request,
		bool persistent,
		CefRefPtr<Callback> callback) override;

	~MsgHandler_MusicPlayer();

private:
	enum CommandName {
		OPEN_PLAYER,
		CLOSE_PLAYER,

		NOT_SUPPORTED
	};

	enum ReturnCode {
		OK = 0,
		FAILED_TO_OPEN = 1,
		ALREADY_RUNNING = 2,
		BAD_REQUEST = 5,
	};

	CommandName GetCommandName(const web::json::value& request);
	void OpenPlayer(web::json::value request, CefRefPtr<Callback> callback);
	void ClosePlayer(CefRefPtr<Callback> callback);
	
	const CefString startup_url_;

	bool running_ = false;
	std::mutex mutex;
	scoped_ptr<MusicPlayer::API> playerApi_;

	DISALLOW_COPY_AND_ASSIGN(MsgHandler_MusicPlayer);
};

#endif