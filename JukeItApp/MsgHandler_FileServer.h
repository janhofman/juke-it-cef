#ifndef MSG_HANDLER_FILE_SERVER_H_
#define MSG_HANDLER_FILE_SERVER_H_

#include <string>
#include <mutex>

#include "cpprestsdk/include/pplx/pplxtasks.h"

#include "abstract_message_handler.h"
#include "AudioInspector.h"
#include "rest.h"
#include "AbstractFileServerHandler.h"
#include "FileServerHandler.h"
#include "SqliteAPI.h"

extern "C" {
#include "tinyfiledialogs.h"
}

class MsgHandler_FileServer : public AbstractMessageHandler {
public:
	explicit MsgHandler_FileServer(const CefString& startup_url);

	bool OnQuery(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id,
		const CefString& request,
		bool persistent,
		CefRefPtr<Callback> callback) override;

	~MsgHandler_FileServer();

private:
	enum CommandName {
		OPEN_SERVER,
		CLOSE_SERVER,

		NOT_SUPPORTED
	};

	enum ReturnCode {
		OK = 0,
		FAILED_TO_OPEN = 1,
		ALREADY_RUNNING = 2,
		BAD_REQUEST = 5,
	};

	CommandName GetCommandName(const web::json::value& request);
	void OpenServer(web::json::value request, CefRefPtr<Callback> callback);
	void CloseServer(CefRefPtr<Callback> callback);
	/*
	std::string LoadGenres(std::unordered_map<std::string, std::string>& params);
	std::string LoadArtists(std::unordered_map<std::string, std::string>& params);
	std::string LoadPlaylists(std::unordered_map<std::string, std::string>& params);
	std::string LoadAlbums();
	std::string LoadSongs();
	std::string SongView(std::unordered_map<std::string, std::string>& params);
	std::string AlbumView(std::unordered_map<std::string, std::string>& params);
	std::string LoadLibraryForPlayback(std::unordered_map<std::string, std::string>& params);
	void AddPlaylist(std::unordered_map<std::string, std::string>& params);
	void AddSongToPlaylist(std::unordered_map<std::string, std::string>& params);
	void CreateDatabase();
	sqlite3* GetDbHandle();
	void AddFiles();
	void AddSongToDatabase(const char *filename, SongMetadata& metadata);
	std::string SqliteHandler::BuildSongViewSQL(std::unordered_map<std::string, std::string>& params);
	std::string SqliteHandler::RunSongViewSQL(std::string& sql);
	*/

	const CefString startup_url_;

	bool running_ = false;
	std::mutex mutex;

	scoped_ptr<FileServerAPI> fileserver_;
	scoped_ptr<AbstractFileServerHandler> fileserver_handler_;
	scoped_ptr<SqliteAPI> sqliteAPI_;

	DISALLOW_COPY_AND_ASSIGN(MsgHandler_FileServer);
};

#endif