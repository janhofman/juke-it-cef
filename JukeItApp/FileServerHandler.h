#ifndef FILE_SERVER_HANDLER_H_
#define FILE_SERVER_HANDLER_H_

#include "AbstractFileServerHandler.h"
#include "SqliteAPI.h"

#include "cpprestsdk/include/cpprest/json.h"
#include "cpprestsdk/include/cpprest/details/basic_types.h"

class FileServerHandler : public AbstractFileServerHandler {
public:
	FileServerHandler(SqliteAPI *database) : db_ptr_(database) {};
	~FileServerHandler() {} ;
	// interface methods
	virtual ResponseCode v1_Songs(std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_Song(const std::string& songId, web::json::value& response) override;
	virtual ResponseCode v1_Albums(std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_Album(const std::string& albumId, web::json::value& response) override;
	virtual ResponseCode v1_AlbumSongs(const std::string& albumId, std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_Artists(std::uint32_t limit, std::uint32_t page, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_Artist(const std::string& artistId, web::json::value& response) override;
	virtual ResponseCode v1_ArtistSongs(const std::string& artistId, std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_Genres(std::uint32_t limit, std::uint32_t page, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_Genre(const std::string& genreId, web::json::value& response) override;
	virtual ResponseCode v1_GenreSongs(const std::string& genreId, std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_Playlists(const std::string& userId, std::uint32_t limit, std::uint32_t page, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_Playlists_Create(const std::string& userId, const std::string& name, const std::string& description, web::json::value& response) override;
	virtual ResponseCode v1_Playlist(const std::string& userId, const std::string& playlistId, web::json::value& response) override;
	virtual ResponseCode v1_Playlist_Modify(const std::string& userId, const std::string& playlistId, const std::string& newName, bool nameChange, const std::string& newDescription, bool descriptionChange, web::json::value& response) override;
	virtual ResponseCode v1_Playlist_Delete(const std::string& userId, const std::string& playlistId) override;
	virtual ResponseCode v1_PlaylistSongs(const std::string& userId, const std::string& playlistId, std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) override;
	virtual ResponseCode v1_PlaylistSongs_Modify(const std::string& userId, const std::string& playlistId, const std::vector<std::string>& add_vect, const std::vector<std::string>& remove_vect) override;

private:
	ResponseCode VerifyDatabase();
	SqliteAPI * db_ptr_ = NULL;

	web::json::value Fill(SqliteAPI::SongResult& song);
	web::json::value Fill(SqliteAPI::AlbumResult& album);
	web::json::value Fill(SqliteAPI::ArtistResult& artist);
	web::json::value Fill(SqliteAPI::GenreResult& genre);
	web::json::value Fill(SqliteAPI::PlaylistResult& playlist);

	web::json::value StringValue(std::string& str);
	web::json::value IdValue(std::uint32_t id);
	bool TryParseUint(const std::string& str, std::uint32_t& result);

	ResponseCode MapErrorCode(SqliteAPI::ErrorCode errCode);

	static const char * FILTER_PARAM;
	static const char * ORDERBY_PARAM;
	static const char * ID_PARAM;
	static const char * ALBUMID_PARAM;
	static const char * ARTISTID_PARAM;
	static const char * GENREID_PARAM;
	static const char * USERID_PARAM;
};

#endif