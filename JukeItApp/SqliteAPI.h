#ifndef SQLITE_API_H_
#define SQLITE_API_H_

#define _TURN_OFF_PLATFORM_STRING

#include <filesystem>
#include <unordered_map>
#include <vector>
#include <fstream>
#include <mutex>
#include <string>

#include "cpprest/json.h"
#include "AudioInspector.h"

extern "C" {
#include "sqlite3/include/sqlite3.h"
#include "tinyfiledialogs.h"
}

class SqliteAPI {
public:
	SqliteAPI();
	SqliteAPI(const std::string& fileName);
	~SqliteAPI();

	enum ErrorCode {
		OK,
		MALFORMED_SQL,
		DATABASE_ERROR,
		ARGUMENT_ERROR,
		DUPLICATE_ENTRY,
		NOT_FOUND
	};

	typedef struct {
		std::uint32_t id;
		std::string title;
		std::string artist;
		std::string album;
		std::string genre;
		std::uint32_t duration;
		std::uint32_t artistId;
		std::uint32_t albumId;
		std::uint32_t genreId;
	} SongResult;

	typedef struct {
		std::uint32_t id;
		std::string name;
		std::string artist;
		std::uint32_t artistId;
	} AlbumResult;

	typedef struct {
		std::uint32_t id;
		std::string name;
	} ArtistResult;

	typedef struct {
		std::uint32_t id;
		std::string name;
	} GenreResult;

	typedef struct {
		std::uint32_t id;
		std::string name;
		std::string description;
		std::string userId;
	} PlaylistResult;

	typedef struct {
		std::uint32_t id;
		std::string title;
		std::string artistName;
		std::string albumName;
		std::string path;
	} NotFoundSongResult;

	// web interface methods
	ErrorCode SongView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<SongResult>& result);
	ErrorCode AlbumView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<AlbumResult>& result);
	ErrorCode Artist(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<ArtistResult>& result);
	ErrorCode Genres(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<GenreResult>& result);
	ErrorCode Playlists(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<PlaylistResult>& result);	
	ErrorCode AddPlaylist(const std::string& userId, const std::string& name, const std::string& description, PlaylistResult& result);
	ErrorCode ModifyPlaylist(const PlaylistResult& changes, bool nameChange, bool descriptionChange, PlaylistResult& result);
	ErrorCode RemovePlaylist(const std::uint32_t playlistId, const std::string& userId);
	ErrorCode ModifyPlaylistSongs(std::uint32_t playlistId, const std::string& userId, std::vector<std::uint32_t>& add, std::vector<std::uint32_t>& remove);
	ErrorCode GetSongPath(const std::uint32_t songId, std::string& path);
	

	ErrorCode BeginTransaction();
	ErrorCode CommitTransaction();
	ErrorCode RollbackTransaction();

	// management interface methods
	void AddFiles();
	bool RemoveFiles(const std::vector<std::string>& remove);
	bool RemoveFile(const std::string& songId);
	void AddSongToDatabase(const char *filename, SongMetadata& metadata);
	bool RunFileAvailiabilityCheck();
	bool RefreshFileAvailability(const std::string& songId, bool& available);
	bool HasNotFoundFiles();
	bool GetNotFoundFiles(std::vector<NotFoundSongResult>& result);

	static const char * FILTER_PARAM;
	static const char * ORDERBY_PARAM;
	static const char * ID_PARAM;
	static const char * ALBUMID_PARAM;
	static const char * ARTISTID_PARAM;
	static const char * GENREID_PARAM;
	static const char * USERID_PARAM;
	static const char * PLAYLISTID_PARAM;

private:	
	ErrorCode AddSongsToPlaylist(std::uint32_t playlistId, std::vector<std::uint32_t>& add);
	ErrorCode RemoveSongsFromPlaylist(std::uint32_t playlistId, std::vector<std::uint32_t>& remove);
	void SetSongNotFound(const bool notFound, const std::uint32_t songId);	 
	bool CleanUpAfterRemoval();
	bool RemoveSong(const std::string& songId);

	sqlite3* GetDbHandle();
	std::mutex dbHandleMutex_;
	void CreateDatabase();
	std::string TextFieldToString(const unsigned char *field);
	static bool TryParseInt(const std::string& str, int& outInt);

	sqlite3* db_handle_ = NULL;
	std::string database_name_;
	static const char * DATABASE_NAME;
};

#endif
