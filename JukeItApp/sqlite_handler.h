#ifndef JUKEIT_SQLITE_HANDLER_H_
#define JUKEIT_SQLITE_HANDLER_H_

#include <experimental/filesystem>

#include "abstract_message_handler.h"
#include "AudioInspector.h"

extern "C" {
	#include "sqlite3/include/sqlite3.h"
	#include "tinyfiledialogs.h"
}


class SqliteHandler : public AbstractMessageHandler {
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
		LOAD_ALBUMS,
		LOAD_ARTISTS,
		LOAD_GENRES,		
		LOAD_SONGS,
		LOAD_LIBRARY,
		SONGVIEW_BY_ID,

		NOT_SUPPORTED
	};

	CommandName GetCommandName(const std::string& command);
	std::string LoadGenres();
	std::string LoadArtists();
	std::string LoadAlbums();
	std::string LoadSongs();
	std::string SongviewById(std::unordered_map<std::string, std::string>& params);
	std::string LoadLibraryForPlayback(std::unordered_map<std::string, std::string>& params);
	void CreateDatabase();
	sqlite3* GetDbHandle();
	void AddFiles();
	void AddSongToDatabase(const char *filename, SongMetadata& metadata);

	const CefString startup_url_;
	sqlite3* db_handle_ = NULL;
	static const char * DATABASE_NAME_;

	DISALLOW_COPY_AND_ASSIGN(SqliteHandler);
};
#endif
