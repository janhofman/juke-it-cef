#include "rest.h"

FileServerAPI::FileServerAPI(const std::string& url , AbstractFileServerHandler *handler) : fsHandler_(handler)
{	
	std::string what;
	try {		
		auto address = utility::conversions::to_string_t(url);
		m_listener = web::http::experimental::listener::http_listener(address);
	}
	catch (std::range_error& e) {
		what = e.what();
		(void)what;
	}

	m_listener.support(web::http::methods::GET, std::bind(&FileServerAPI::handle_get, this, std::placeholders::_1));
	/*m_listener.support(web::http::methods::PUT, std::bind(&FileServerAPI::handle_put, this, std::placeholders::_1));
	m_listener.support(web::http::methods::POST, std::bind(&FileServerAPI::handle_post, this, std::placeholders::_1));
	m_listener.support(web::http::methods::DEL, std::bind(&FileServerAPI::handle_delete, this, std::placeholders::_1));*/
}

void FileServerAPI::handle_get(web::http::http_request message)
{
	auto paths = web::http::uri::split_path(web::http::uri::decode(message.relative_uri().path()));
	auto query = message.relative_uri().query();
	auto queries = web::http::uri::split_query(query);
	if (paths.empty())
	{
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	if (paths[0] == U("v1")) {
		v1_HandleGET(message, paths, queries);
	}
};

void FileServerAPI::handle_post(web::http::http_request message) {
	auto paths = web::http::uri::split_path(web::http::uri::decode(message.relative_uri().path()));
	auto query = message.relative_uri().query();
	auto queries = web::http::uri::split_query(query);
	if (paths.empty())
	{
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	if (paths[0] == U("v1")) {
		v1_HandlePOST(message, paths, queries);
	}
}

void FileServerAPI::v1_HandleGET(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	auto pathLength = paths.size();

	if (pathLength > 1) {
		if (paths[1] == U("songs")) {
			if (pathLength == 2) {
				v1_Songs(message, paths, queries);
			}
			else if (pathLength == 3) {
				v1_Song(message, paths);
			}
			else {
				message.reply(web::http::status_codes::NotFound);
			}			
		}
		else if (paths[1] == U("albums")) {
			if (pathLength == 2) {
				v1_Albums(message, paths, queries);
			}
			else if (pathLength == 3) {
				v1_Album(message, paths);
			}
			else if (pathLength == 4 && paths[3] == U("songs")) {
				v1_AlbumSongs(message, paths, queries);
			}
			else {
				message.reply(web::http::status_codes::NotFound);
			}
		}
		else if (paths[1] == U("artists")) {
			if (pathLength == 2) {
				v1_Artists(message, paths, queries);
			}
			else if (pathLength == 3) {
				v1_Artist(message, paths);
			}
			else if (pathLength == 4 && paths[3] == U("songs")) {
				v1_ArtistSongs(message, paths, queries);
			}
			else {
				message.reply(web::http::status_codes::NotFound);
			}
		}
		else if (paths[1] == U("genres")) {
			if (pathLength == 2) {
				v1_Genres(message, paths, queries);
			}
			else if (pathLength == 3) {
				v1_Genre(message, paths);
			}
			else if (pathLength == 4 && paths[3] == U("songs")) {
				v1_GenreSongs(message, paths, queries);
			}
			else {
				message.reply(web::http::status_codes::NotFound);
			}
		}
		else if (paths[1] == U("playlists")) {
			if (pathLength == 3) {
				v1_Playlists(message, paths, queries);
			}
			else if (pathLength == 4) {
				v1_Playlist(message, paths);
			}
			else if (pathLength == 5 && paths[4] == U("songs")) {
				v1_PlaylistSongs(message, paths, queries);
			}
			else {
				message.reply(web::http::status_codes::NotFound);
			}
		}
		else {
			message.reply(web::http::status_codes::NotFound);
			return;
		}
	}
	else {
		message.reply(web::http::status_codes::NotFound);
		return;
	}
}

void FileServerAPI::v1_HandlePOST(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	auto pathLength = paths.size();

	if (pathLength > 1) {
		if (paths[1] == U("playlists")) {
			if (pathLength == 3) {
				v1_Playlists_Create(message, paths, queries);
			}
			else {
				message.reply(web::http::status_codes::NotFound);
			}
		}
		else {
			message.reply(web::http::status_codes::NotFound);
			return;
		}
	}
	else {
		message.reply(web::http::status_codes::NotFound);
		return;
	}
}

void FileServerAPI::v1_Songs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Songs(params.limit, params.page, params.orderBy, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Song(web::http::http_request message, const std::vector<utility::string_t>& paths) {
	std::string songId = utility::conversions::to_utf8string(paths[2]);
	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Song(songId, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Albums(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Albums(params.limit, params.page, params.orderBy, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Album(web::http::http_request message, const std::vector<utility::string_t>& paths) {
	std::string albumId = utility::conversions::to_utf8string(paths[2]);
	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Album(albumId, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_AlbumSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	std::string albumId = utility::conversions::to_utf8string(paths[2]);
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_AlbumSongs(albumId, params.limit, params.page, params.orderBy, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Artists(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Artists(params.limit, params.page, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Artist(web::http::http_request message, const std::vector<utility::string_t>& paths) {
	std::string artistId = utility::conversions::to_utf8string(paths[2]);
	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Artist(artistId, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_ArtistSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	std::string artistId = utility::conversions::to_utf8string(paths[2]);
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_ArtistSongs(artistId, params.limit, params.page, params.orderBy, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Genres(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Genres(params.limit, params.page, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Genre(web::http::http_request message, const std::vector<utility::string_t>& paths) {
	std::string genreId = utility::conversions::to_utf8string(paths[2]);
	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Genre(genreId, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_GenreSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	std::string genreId = utility::conversions::to_utf8string(paths[2]);
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_GenreSongs(genreId, params.limit, params.page, params.orderBy, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Playlists(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	std::string userId = utility::conversions::to_utf8string( paths[2]);
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Playlists(userId, params.limit, params.page, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Playlists_Create(web::http::http_request message, const std::vector<utility::string_t>& paths) {
	std::string userId = utility::conversions::to_utf8string(paths[2]);

	message.extract_json().then([=](pplx::task<web::json::value> requestTask) -> ResultTuple {
		try {
			auto request = requestTask.get();
			if (request.is_object()) {
				auto obj = request.as_object();
				auto valIt = obj.find(U("name"));
				if (valIt != obj.end() && valIt->second.is_string()) {
					std::string name = utility::conversions::to_utf8string(valIt->second.as_string());

					valIt = obj.find(U("description"));
					std::string description;
					if (valIt != obj.end() && valIt->second.is_string()) {
						description = utility::conversions::to_utf8string(valIt->second.as_string());
					}

					web::json::value response;
					auto rtc = fsHandler_->v1_Playlists_Create(userId, name, description, response);
					message.reply(MapStatusCode(rtc), response);
				}
				else {
					message.reply(web::http::status_codes::BadRequest);
				}
			}
			else {
				message.reply(web::http::status_codes::BadRequest);
			}
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_Playlist(web::http::http_request message, const std::vector<utility::string_t>& paths) {
	std::string userId = utility::conversions::to_utf8string(paths[2]);
	std::string playlistId = utility::conversions::to_utf8string(paths[3]);

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_Playlist(userId, playlistId, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

void FileServerAPI::v1_PlaylistSongs(web::http::http_request message, const std::vector<utility::string_t>& paths, const std::map<utility::string_t, utility::string_t>& queries) {
	std::string userId = utility::conversions::to_utf8string(paths[2]);
	std::string playlistId = utility::conversions::to_utf8string(paths[3]);
	QueryParams params;
	if (!ParseQueryParams(queries, params)) {
		message.reply(web::http::status_codes::NotFound);
		return;
	}

	pplx::create_task([=]() -> ResultTuple {
		web::json::value response;
		auto rtc = fsHandler_->v1_PlaylistSongs(userId, playlistId, params.limit, params.page, params.orderBy, params.desc, params.filter, response);
		return std::make_tuple(rtc, response);
	}).then([=](pplx::task<ResultTuple> resultTask) {
		try {
			auto result = resultTask.get();
			auto rtc = std::get<0>(result);
			auto json = std::get<1>(result);
			message.reply(MapStatusCode(rtc), json);
		}
		catch (std::exception) {
			message.reply(web::http::status_codes::InternalError);
		}
	});
}

bool FileServerAPI::TryParseUint(const utility::string_t& s, std::uint32_t& outValue) {
	if (s.size() > 0) {
		std::uint32_t val = 0;
		for (auto it = s.begin(); it != s.end(); it++) {
			if (isdigit(*it)) {
				val *= 10;
				val += *it - '0';
			}
			else {
				return false;
			}
		}
		outValue = val;
		return true;
	}
	return false;
}

bool FileServerAPI::ParseQueryParams(const std::map<utility::string_t, utility::string_t>& queries, FileServerAPI::QueryParams& params) {
	params.page = 1;
	auto queryIt = queries.find(U("page"));
	if (queryIt != queries.end()) {
		std::uint32_t num = 0;
		if (TryParseUint(queryIt->second, num)) {			
			params.page = num;
		}
		else {
			return false;
		}
	}

	params.limit = 100;
	queryIt = queries.find(U("limit"));
	if (queryIt != queries.end()) {
		std::uint32_t num = 0;
		if (TryParseUint(queryIt->second, num)) {
			params.limit = num;
		}
		else {
			return false;
		}
	}

	queryIt = queries.find(U("orderby"));
	if (queryIt != queries.end()) {
		params.orderBy = utility::conversions::to_utf8string(queryIt->second);
	}

	params.desc = false;
	queryIt = queries.find(U("desc"));
	if (queryIt != queries.end() && queryIt->second == U("desc")) {
		params.desc = true;
	}

	queryIt = queries.find(U("filter"));
	if (queryIt != queries.end()) {
		params.filter = utility::conversions::to_utf8string(queryIt->second);
	}

	return true;
}

web::http::status_code FileServerAPI::MapStatusCode(AbstractFileServerHandler::ResponseCode responseCode) {
	// TODO: map statuses
	return web::http::status_codes::OK;
}

