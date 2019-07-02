#include "FileServerHandler.h"
#include <sstream>



FileServerHandler::ResponseCode FileServerHandler::v1_Songs(std::uint32_t limit, std::uint32_t start, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	if (!orderBy.empty()) {
		params[SqliteAPI::ORDERBY_PARAM] = orderBy;
	}
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::SongResult> result;
	auto errCode = db_ptr_->SongView(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Song(const std::string& songId, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::ID_PARAM] = songId;
	std::vector<SqliteAPI::SongResult> result;
	auto errCode = db_ptr_->SongView(params, 1, 1, true, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		if (result.size() == 1) {
			response = Fill(result[0]);
			return ResponseCode::CODE_200_OK;
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Albums(std::uint32_t limit, std::uint32_t start, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	if (!orderBy.empty()) {
		params[SqliteAPI::ORDERBY_PARAM] = orderBy;
	}
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::AlbumResult> result;
	auto errCode = db_ptr_->AlbumView(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Album(const std::string& albumId, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::ID_PARAM] = albumId;
	std::vector<SqliteAPI::AlbumResult> result;
	auto errCode = db_ptr_->AlbumView(params, 1, 1, true, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		if (result.size() == 1) {
			response = Fill(result[0]);
			return ResponseCode::CODE_200_OK;
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_AlbumSongs(const std::string& albumId, std::uint32_t limit, std::uint32_t start, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::ALBUMID_PARAM] = albumId;
	if (!orderBy.empty()) {
		params[SqliteAPI::ORDERBY_PARAM] = orderBy;
	}
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::SongResult> result;
	auto errCode = db_ptr_->SongView(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Artists(std::uint32_t limit, std::uint32_t start, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::ArtistResult> result;
	auto errCode = db_ptr_->Artist(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Artist(const std::string& artistId, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::ID_PARAM] = artistId;
	
	std::vector<SqliteAPI::ArtistResult> result;
	auto errCode = db_ptr_->Artist(params, 1, 1, true, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		if (result.size() == 1) {
			response = Fill(result[0]);
			return ResponseCode::CODE_200_OK;
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_ArtistSongs(const std::string& artistId, std::uint32_t limit, std::uint32_t start, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::ARTISTID_PARAM] = artistId;
	if (!orderBy.empty()) {
		params[SqliteAPI::ORDERBY_PARAM] = orderBy;
	}
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::SongResult> result;
	auto errCode = db_ptr_->SongView(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Genres(std::uint32_t limit, std::uint32_t start, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::GenreResult> result;
	auto errCode = db_ptr_->Genres(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Genre(const std::string& genreId, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::ID_PARAM] = genreId;

	std::vector<SqliteAPI::GenreResult> result;
	auto errCode = db_ptr_->Genres(params, 1, 1, true, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		if (result.size() == 1) {
			response = Fill(result[0]);
			return ResponseCode::CODE_200_OK;
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_GenreSongs(const std::string& genreId, std::uint32_t limit, std::uint32_t start, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::GENREID_PARAM] = genreId;
	if (!orderBy.empty()) {
		params[SqliteAPI::ORDERBY_PARAM] = orderBy;
	}
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::SongResult> result;
	auto errCode = db_ptr_->SongView(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Playlists(const std::string& userId, std::uint32_t limit, std::uint32_t start, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::USERID_PARAM] = userId;
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::PlaylistResult> result;
	auto errCode = db_ptr_->Playlists(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Playlists_Create(const std::string& userId, const std::string& name, const std::string& description, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	SqliteAPI::PlaylistResult result;
	auto errCode = db_ptr_->AddPlaylist(userId, name, description, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = Fill(result);
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Playlist(const std::string& userId, const std::string& playlistId, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::ID_PARAM] = playlistId;
	params[SqliteAPI::USERID_PARAM] = userId;

	std::vector<SqliteAPI::PlaylistResult> result;
	auto errCode = db_ptr_->Playlists(params, 1, 1, true, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		if (result.size() == 1) {
			response = Fill(result[0]);
			return ResponseCode::CODE_200_OK;
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Playlist_Modify(const std::string& userId, const std::string& playlistId, const std::string& newName, bool nameChange, const std::string& newDescription, bool descriptionChange, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	SqliteAPI::PlaylistResult changes;
	if (!TryParseUint(playlistId, changes.id)) {
		// TODO: return fitting error
		return ResponseCode::CODE_404_NOT_FOUND;
	}
	changes.userId = userId;
	changes.name = newName;
	changes.description = newDescription;
	SqliteAPI::PlaylistResult result;
	auto errCode = db_ptr_->ModifyPlaylist(changes, nameChange, descriptionChange, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = Fill(result);
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_Playlist_Delete(const std::string& userId, const std::string& playlistId) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::uint32_t plId = 0;
	if (TryParseUint(playlistId, plId)) {
		auto errCode = db_ptr_->RemovePlaylist(plId, userId);
		return MapErrorCode(errCode);
	}
	return ResponseCode::CODE_404_NOT_FOUND;
}

FileServerHandler::ResponseCode FileServerHandler::v1_PlaylistSongs(const std::string& userId, const std::string& playlistId, std::uint32_t limit, std::uint32_t start, const std::string& orderBy, bool desc, const std::string& filter, web::json::value& response) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::unordered_map<std::string, std::string> params;
	params[SqliteAPI::PLAYLISTID_PARAM] = playlistId;
	params[SqliteAPI::USERID_PARAM] = userId;
	if (!orderBy.empty()) {
		params[SqliteAPI::ORDERBY_PARAM] = orderBy;
	}
	if (!filter.empty()) {
		params[SqliteAPI::FILTER_PARAM] = filter;
	}
	std::vector<SqliteAPI::SongResult> result;
	auto errCode = db_ptr_->SongView(params, limit, start, desc, result);

	if (errCode == SqliteAPI::ErrorCode::OK) {
		response = web::json::value::array(result.size());
		for (size_t i = 0; i < result.size(); i++)
		{
			response.as_array()[i] = Fill(result[i]);
		}
	}
	return MapErrorCode(errCode);
}

FileServerHandler::ResponseCode FileServerHandler::v1_PlaylistSongs_Modify(const std::string& userId, const std::string& playlistId, const std::vector<std::string>& add_vect, const std::vector<std::string>& remove_vect) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::uint32_t plId = 0;
	if (TryParseUint(playlistId, plId)) {
		std::vector<std::uint32_t> add;
		for (size_t i = 0; i < add_vect.size(); i++)
		{
			std::uint32_t num = 0;
			if (TryParseUint(add_vect[i], num)) {
				add.push_back(num);
			}
		}
		std::vector<std::uint32_t> remove;
		for (size_t i = 0; i < remove_vect.size(); i++)
		{
			std::uint32_t num = 0;
			if (TryParseUint(remove_vect[i], num)) {
				remove.push_back(num);
			}
		}
		auto errCode = db_ptr_->ModifyPlaylistSongs(plId, userId, add, remove);
		return MapErrorCode(errCode);
	}
	else {
		return ResponseCode::CODE_404_NOT_FOUND;
	}
}

FileServerHandler::ResponseCode FileServerHandler::v1_GetSong(const std::string& songId, std::string& songPath) {
	auto rtc = VerifyDatabase();
	if (rtc != ResponseCode::CODE_200_OK) {
		return rtc;
	}

	std::uint32_t songIdUINT = 0;
	if (TryParseUint(songId, songIdUINT)) {
		auto errCode = db_ptr_->GetSongPath(songIdUINT, songPath);
		return MapErrorCode(errCode);
	}
	else {
		return ResponseCode::CODE_404_NOT_FOUND;
	}
}

FileServerHandler::ResponseCode FileServerHandler::v1_Ping() {
	return ResponseCode::CODE_200_OK;
}

web::json::value FileServerHandler::Fill(SqliteAPI::SongResult& song) {
	web::json::value obj;

	obj[U("id")] = IdValue(song.id);
	obj[U("title")] = StringValue(song.title);
	obj[U("artist")] = StringValue(song.artist);
	obj[U("album")] = StringValue(song.album);
	obj[U("genre")] = StringValue(song.genre);
	obj[U("duration")] = web::json::value::number(song.duration);
	obj[U("artistId")] = IdValue(song.artistId);
	obj[U("albumId")] = IdValue(song.albumId);
	obj[U("genreId")] = IdValue(song.genreId);

	return obj;
}

web::json::value FileServerHandler::Fill(SqliteAPI::AlbumResult& album) {
	web::json::value obj;

	obj[U("id")] = IdValue(album.id);
	obj[U("name")] = StringValue(album.name);
	obj[U("artist")] = StringValue(album.artist);
	obj[U("artistId")] = IdValue(album.artistId);

	return obj;
}

web::json::value FileServerHandler::Fill(SqliteAPI::ArtistResult& artist) {
	web::json::value obj;

	obj[U("id")] = IdValue(artist.id);
	obj[U("name")] = StringValue(artist.name);

	return obj;
}

web::json::value FileServerHandler::Fill(SqliteAPI::GenreResult& genre) {
	web::json::value obj;

	obj[U("id")] = IdValue(genre.id);
	obj[U("name")] = StringValue(genre.name);

	return obj;
}

web::json::value FileServerHandler::Fill(SqliteAPI::PlaylistResult& playlist) {
	web::json::value obj;

	obj[U("id")] = IdValue(playlist.id);
	obj[U("name")] = StringValue(playlist.name);
	obj[U("description")] = StringValue(playlist.description);
	obj[U("userId")] = StringValue(playlist.userId);

	return obj;
}

web::json::value FileServerHandler::StringValue(std::string& str) {
	if (str.empty()) {
		return web::json::value::null();
	}
	return web::json::value::string(utility::conversions::to_string_t(str));
}

web::json::value FileServerHandler::IdValue(std::uint32_t id) {
	if (id == 0) {
		return web::json::value::null();
	}
	return web::json::value::string(utility::conversions::to_string_t(std::to_string(id)));
}


bool FileServerHandler::TryParseUint(const std::string& str, std::uint32_t& result) {
	if (str.empty()) {
		return false;
	}
	std::uint32_t num = 0;
	for (auto it = str.begin(); it != str.end(); it++)
	{
		if (isdigit(*it)) {
			num *= 10;
			num += (*it - '0');
		}
		else {
			return false;
		}
	}
	result = num;
	return true;
}

FileServerHandler::ResponseCode FileServerHandler::MapErrorCode(SqliteAPI::ErrorCode errCode) {
	// TODO: fill properly
	if (errCode == SqliteAPI::ErrorCode::OK) {
		return ResponseCode::CODE_200_OK;
	}
	else {
		return ResponseCode::CODE_500_INTERNAL_SERVER_ERROR;
	}
}


FileServerHandler::ResponseCode FileServerHandler::VerifyDatabase() {
	if (db_ptr_ == nullptr) {
		// log database error
		return ResponseCode::CODE_500_INTERNAL_SERVER_ERROR;
	}
	return ResponseCode::CODE_200_OK;
}