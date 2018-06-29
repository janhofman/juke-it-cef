#ifndef SQLITE_API_H_
#define SQLITE_API_H_

#define _TURN_OFF_PLATFORM_STRING

#include <unordered_map>
#include <vector>
#include <fstream>

#include "cpprestsdk/include/cpprest/json.h"
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
		DUPLICATE_ENTRY
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

	ErrorCode SongView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<SongResult>& result);
	ErrorCode AlbumView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<AlbumResult>& result);
	ErrorCode Artist(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<ArtistResult>& result);
	ErrorCode Genres(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<GenreResult>& result);
	ErrorCode Playlists(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<PlaylistResult>& result);
	void AddFiles();
	void AddSongToDatabase(const char *filename, SongMetadata& metadata);
	ErrorCode AddPlaylist(const std::string& userId, const std::string& name, const std::string& description, PlaylistResult& result);
	ErrorCode ModifyPlaylist(const PlaylistResult& changes, bool nameChange, bool descriptionChange, PlaylistResult& result);
	ErrorCode RemovePlaylist(const std::uint32_t playlistId, const std::string& userId);
	ErrorCode ModifyPlaylistSongs(std::uint32_t playlistId, const std::string& userId, std::vector<std::uint32_t>& add, std::vector<std::uint32_t>& remove);

private:	
	ErrorCode AddSongsToPlaylist(std::uint32_t playlistId, std::vector<std::uint32_t>& add);
	ErrorCode RemoveSongsFromPlaylist(std::uint32_t playlistId, std::vector<std::uint32_t>& remove);


	bool FileExists(const std::string& filename);
	sqlite3* GetDbHandle();
	void CreateDatabase();
	std::string TextFieldToString(const unsigned char *field);

	sqlite3* db_handle_ = NULL;
	std::string database_name_;
	static const char * DATABASE_NAME;
};

#endif
