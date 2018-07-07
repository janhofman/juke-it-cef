#ifndef REST_API_H_
#define REST_API_H_

#include "cpprestsdk/include/cpprest/json.h"
#include "cpprestsdk/include/cpprest/http_listener.h"
#include "cpprestsdk/include/cpprest/uri.h"
#include "cpprestsdk/include/cpprest/asyncrt_utils.h"
#include "cpprestsdk/include/pplx/pplxtasks.h"

#include "AbstractFileServerHandler.h"
#include <exception>
#include <string>
#include <tuple>

class FileServerAPI
{
public:
	FileServerAPI() { }
	FileServerAPI(const std::string& url, AbstractFileServerHandler *handler);

	pplx::task<void> open() { return m_listener.open(); }
	pplx::task<void> close() { return m_listener.close(); }

private:
	typedef std::tuple<AbstractFileServerHandler::ResponseCode, web::json::value> ResultTuple;
	typedef struct {
		std::uint32_t limit;
		std::uint32_t page;
		std::string id;
		std::string filter;
		std::string orderBy;
		bool desc;
	} QueryParams;

	void handle_get(web::http::http_request message);
	//void handle_put(web::http::http_request message);
	void handle_post(web::http::http_request message);
	//void handle_delete(web::http::http_request message);
	void v1_HandleGET(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_HandlePOST(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);

	AbstractFileServerHandler *fsHandler_ = NULL;
	web::http::experimental::listener::http_listener m_listener;
	bool TryParseUint(const utility::string_t& s, std::uint32_t& outValue);
	web::http::status_code MapStatusCode(AbstractFileServerHandler::ResponseCode responseCode);	
	bool ParseQueryParams(const std::map<utility::string_t, utility::string_t>& queries, QueryParams& params);

	void v1_Songs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_Song(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_Albums(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_Album(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_AlbumSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_Artists(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_Artist(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_ArtistSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_Genres(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_Genre(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_GenreSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_Playlists(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_Playlists_Create(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_Playlist(web::http::http_request message, const std::vector<utility::string_t>& paths);
	//virtual ResponseCode v1_Playlist_Modify(const std::string& userId, const std::string& playlistId, const std::string& newName, bool nameChange, const std::string& newDescription, bool descriptionChange, web::json::value& response) = 0;
	//virtual ResponseCode v1_Playlist_Delete(const std::string& userId, const std::string& playlistId) = 0;
	void v1_PlaylistSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	//virtual ResponseCode v1_PlaylistSongs_Modify(const std::string& userId, const std::string& playlistId, const std::vector<std::string>& add_vect, const std::vector<std::string>& remove_vect) = 0;*/
};

#endif
