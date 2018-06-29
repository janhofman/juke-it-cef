#ifndef ABSTRACTFILESERVERHANDLER_H_
#define ABSTRACTFILESERVERHANDLER_H_

#include <vector>
#include "cpprestsdk/include/cpprest/json.h"

class AbstractFileServerHandler {
public:
	enum ResponseCode {
		CODE_200_OK,
		CODE_201_ACCEPTED,
		CODE_202_CREATED, 

		CODE_404_NOT_FOUND,

		CODE_500_INTERNAL_SERVER_ERROR
	};

	virtual ResponseCode v1_Songs(std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_Song(const std::string& songId, web::json::value& response) = 0;
	virtual ResponseCode v1_Albums(std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_Album(const std::string& albumId, web::json::value& response) = 0;
	virtual ResponseCode v1_AlbumSongs(const std::string& albumId, std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_Artists(std::uint32_t limit, std::uint32_t page, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_Artist(const std::string& artistId, web::json::value& response) = 0;
	virtual ResponseCode v1_ArtistSongs(const std::string& artistId, std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_Genres(std::uint32_t limit, std::uint32_t page, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_Genre(const std::string& genreId, web::json::value& response) = 0;
	virtual ResponseCode v1_GenreSongs(const std::string& genreId, std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_Playlists(const std::string& userId, std::uint32_t limit, std::uint32_t page, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_Playlists_Create(const std::string& userId, const std::string& name, const std::string& description, web::json::value& response) = 0;
	virtual ResponseCode v1_Playlist(const std::string& userId, const std::string& playlistId, web::json::value& response) = 0;
	virtual ResponseCode v1_Playlist_Modify(const std::string& userId, const std::string& playlistId, const std::string& newName, bool nameChange, const std::string& newDescription, bool descriptionChange, web::json::value& response) = 0;
	virtual ResponseCode v1_Playlist_Delete(const std::string& userId, const std::string& playlistId) = 0;
	virtual ResponseCode v1_PlaylistSongs(const std::string& userId, const std::string& playlistId, std::uint32_t limit, std::uint32_t page, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) = 0;
	virtual ResponseCode v1_PlaylistSongs_Modify(const std::string& userId, const std::string& playlistId, const std::vector<std::string>& add_vect, const std::vector<std::string>& remove_vect) = 0;

	virtual ~AbstractFileServerHandler() {};
};

#endif