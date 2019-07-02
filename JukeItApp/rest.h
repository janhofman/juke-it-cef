#ifndef REST_API_H_
#define REST_API_H_

#include "cpprestsdk/include/cpprest/json.h"
#include "cpprestsdk/include/cpprest/http_listener.h"
#include "cpprestsdk/include/cpprest/uri.h"
#include "cpprestsdk/include/cpprest/asyncrt_utils.h"
#include "cpprestsdk/include/pplx/pplxtasks.h"
#include "cpprestsdk/include/cpprest/filestream.h"
//#include "cpprestsdk/include/cpprest/containerstream.h"
//#include "cpprestsdk/include/cpprest/producerconsumerstream.h"

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
	std::string GetAddressUTF8();
	utility::string_t GetAddress();

private:
	typedef std::tuple<AbstractFileServerHandler::ResponseCode, web::json::value> ResultTuple;
	typedef struct {
		std::uint32_t limit;
		std::uint32_t start;
		std::string id;
		std::string filter;
		std::string orderBy;
		bool desc;
	} QueryParams;

	void handle_get(web::http::http_request message);
	void handle_put(web::http::http_request message);
	void handle_post(web::http::http_request message);
	void handle_delete(web::http::http_request message);
	void handle_options(web::http::http_request request);
	void v1_HandleGET(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_HandlePUT(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_HandlePOST(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_HandleDELETE(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);

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
	void v1_Playlist_Modify(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_Playlist_Delete(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_PlaylistSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries);
	void v1_PlaylistSongs_Modify(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_GetSong(web::http::http_request message, const std::vector<utility::string_t>& paths);
	void v1_Ping(web::http::http_request message);
	void Reply(const web::http::http_request& message, web::http::status_code code);
	void Reply(const web::http::http_request& message, web::http::status_code code, const web::json::value& bodyData);
};

#endif
