#include "SqliteAPI.h"

const char * SqliteAPI::DATABASE_NAME = "data.dat";

SqliteAPI::SqliteAPI() : database_name_(DATABASE_NAME) {};

SqliteAPI::SqliteAPI(const std::string& fileName) : database_name_(fileName) {};

SqliteAPI::~SqliteAPI() {
	if (db_handle_) {
		sqlite3_close_v2(db_handle_);
	}
}

SqliteAPI::ErrorCode SqliteAPI::Genres(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<SqliteAPI::GenreResult>& result) {
	std::stringstream ss;
	ss << "SELECT id, name FROM genre";
	if (params.size() > 0) {
		bool first = true;
		for (auto it = params.begin(); it != params.end(); it++)
		{
			if (it->first == "id") {
				if (first) {
					ss << " WHERE ";
				}
				else {
					ss << " AND ";
				}
				ss << it->first << '=' << it->second;
				first = false;
			}
		}
		auto it = params.find("filter");
		if (it != params.end()) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "name LIKE " << "'%" << it->second << "%'";
		}

		// add ORDER BY clause and pagination
		std::string orderBy = "name";
		std::string asc_desc = desc ? "DESC" : "ASC";

		std::uint32_t offset = (page - 1) * limit;
		if (offset > 0) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "id NOT IN (SELECT id FROM genre ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
		}
		ss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;
	}
	std::string sql = ss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			GenreResult genre;
			genre.id = sqlite3_column_int(statement, 0);
			genre.name = TextFieldToString(sqlite3_column_text(statement, 1));
			result.push_back(genre);

			rtc = sqlite3_step(statement);
		}
		sqlite3_finalize(statement);
		return ErrorCode::OK;
	}
	else {
		return ErrorCode::MALFORMED_SQL;
	}	
}

SqliteAPI::ErrorCode SqliteAPI::Artist(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<SqliteAPI::ArtistResult>& result) {
	std::stringstream ss;
	ss << "SELECT id, name FROM artist";
	if (params.size() > 0) {
		bool first = true;
		for (auto it = params.begin(); it != params.end(); it++)
		{
			if (it->first == "id") {
				if (first) {
					ss << " WHERE ";
				}
				else {
					ss << " AND ";
				}
				ss << it->first << '=' << it->second;
				first = false;
			}
		}
		auto it = params.find("filter");
		if (it != params.end()) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "name LIKE " << "'%" << it->second << "%'";
		}

		// add ORDER BY clause and pagination
		std::string orderBy = "name";
		std::string asc_desc = desc ? "DESC" : "ASC";

		std::uint32_t offset = (page - 1) * limit;
		if (offset > 0) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "id NOT IN (SELECT id FROM artist ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
		}
		ss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;
	}
	std::string sql = ss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			ArtistResult artist;
			artist.id = sqlite3_column_int(statement, 0);
			artist.name = TextFieldToString(sqlite3_column_text(statement, 1));
			result.push_back(artist);

			rtc = sqlite3_step(statement);
		}
		sqlite3_finalize(statement);
		return ErrorCode::OK;
	}
	else {
		return ErrorCode::MALFORMED_SQL;
	}
}

SqliteAPI::ErrorCode SqliteAPI::Playlists(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<SqliteAPI::PlaylistResult>& result) {
	std::stringstream ss;
	ss << "SELECT id, name, description, userId FROM playlist";
	if (params.size() > 0) {
		bool first = true;
		for (auto it = params.begin(); it != params.end(); it++)
		{
			if (it->first == "id") {
				if (first) {
					ss << " WHERE ";
				}
				else {
					ss << " AND ";
				}
				ss << it->first << '=' << it->second;
				first = false;
			}
			else if (it->first == "userId" ||
				it->first == "name") {
				if (first) {
					ss << " WHERE ";
				}
				else {
					ss << " AND ";
				}
				ss << it->first << "='" << it->second << '\'';
				first = false;
			}
		}
		auto it = params.find("filter");
		if (it != params.end()) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "name LIKE " << "'%" << it->second << "%'";
		}

		// add ORDER BY clause and pagination
		std::string orderBy = "name";
		std::string asc_desc = desc ? "DESC" : "ASC";

		std::uint32_t offset = (page - 1) * limit;
		if (offset > 0) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "id NOT IN (SELECT id FROM playlist ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
		}
		ss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;
	}
	std::string sql = ss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			PlaylistResult playlist;
			playlist.id = sqlite3_column_int(statement, 0);
			playlist.name = TextFieldToString(sqlite3_column_text(statement, 1));
			playlist.description = TextFieldToString(sqlite3_column_text(statement, 2));
			playlist.userId = TextFieldToString(sqlite3_column_text(statement, 3));
			result.push_back(playlist);

			rtc = sqlite3_step(statement);
		}
		sqlite3_finalize(statement);
		return ErrorCode::OK;
	}
	else {
		return ErrorCode::MALFORMED_SQL;
	}
}

SqliteAPI::ErrorCode SqliteAPI::SongView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<SqliteAPI::SongResult>& result) {
	std::stringstream ss;
	ss << "SELECT s.id, s.title, s.artist, s.album, s.genre, s.length, s.artistId, s.albumId, s.genreId FROM songView AS s";
	if (params.size() > 0) {
		bool first = true;
		// playlistId is more difficult, handle it first
		auto it = params.find("playlistId");
		if (params.find("playlistId") != params.end()) {
			ss << " INNER JOIN playlistSong AS ps ON (ps.songId = s.id)";
			ss << " WHERE ps.playlistId=" << it->second;
			first = false;
		}
		for (it = params.begin(); it != params.end(); it++)
		{
			if (it->first == "id"
				|| it->first == "artistId"
				|| it->first == "albumId"
				|| it->first == "genreId"
				) {
				if (first) {
					ss << " WHERE ";
				}
				else {
					ss << " AND ";
				}
				ss << "s." << it->first << '=' << it->second;
				first = false;
			}
		}
		it = params.find("filter");
		if (it != params.end()) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "s.title LIKE " << "'%" << it->second << "%'";
		}

		// add ORDER BY clause and pagination
		std::string orderBy = "s.id";
		it = params.find("orderby");
		if (it != params.end()) {
			if (it->second == "title") {
				orderBy = "s.title";
			}
			else if (it->second == "artist") {
				orderBy = "s.artist";
			}
			else if (it->second == "album") {
				orderBy = "s.album";
			}
			else if (it->second == "genre") {
				orderBy = "s.genre";
			}
			else if (it->second == "duration") {
				orderBy = "s.length";
			}
		}
		std::string asc_desc = desc ? "DESC" : "ASC";

		std::uint32_t offset = (page - 1) * limit;
		if (offset > 0) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "s.id NOT IN (SELECT id FROM songview AS s ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
		}
		ss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;
	}
	std::string sql = ss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			SongResult song;
			song.id = sqlite3_column_int(statement, 0);
			song.title = TextFieldToString(sqlite3_column_text(statement, 1));
			song.artist = TextFieldToString(sqlite3_column_text(statement, 2));
			song.album = TextFieldToString(sqlite3_column_text(statement, 3));
			song.genre = TextFieldToString(sqlite3_column_text(statement, 4));
			song.duration = sqlite3_column_int(statement, 5);
			song.artistId = sqlite3_column_int(statement, 6);
			song.albumId = sqlite3_column_int(statement, 7);
			song.genreId = sqlite3_column_int(statement, 8);
			result.push_back(song);

			rtc = sqlite3_step(statement);
		}
		sqlite3_finalize(statement);
		return ErrorCode::OK;
	}
	else {
		return ErrorCode::MALFORMED_SQL;
	}
}

SqliteAPI::ErrorCode SqliteAPI::AlbumView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, std::vector<SqliteAPI::AlbumResult>& result) {
	std::stringstream ss;
	ss << "SELECT id, name, artist, artistId FROM albumView";
	if (params.size() > 0) {
		bool first = true;
		for (auto it = params.begin(); it != params.end(); it++)
		{
			if (it->first == "id"
				|| it->first == "artistId"
				) {
				if (first) {
					ss << " WHERE ";
				}
				else {
					ss << " AND ";
				}
				ss << it->first << '=' << it->second;
				first = false;
			}
		}
		auto it = params.find("filter");
		if (it != params.end()) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "name LIKE " << "'%" << it->second << "%'";
		}

		std::string orderBy = "artist, name";
		it = params.find("orderby");
		if (it != params.end()) {
			if (it->second == "name") {
				orderBy = "name";
			}
		}
		std::string asc_desc = desc ? "DESC" : "ASC";

		std::uint32_t offset = (page - 1) * limit;
		if (offset > 0) {
			if (first) {
				ss << " WHERE ";
			}
			else {
				ss << " AND ";
			}
			ss << "id NOT IN (SELECT id FROM albumView ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
		}
		ss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;
	}
	std::string sql = ss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			AlbumResult album;
			album.id = sqlite3_column_int(statement, 0);
			album.name = TextFieldToString(sqlite3_column_text(statement, 1));
			album.artist = TextFieldToString(sqlite3_column_text(statement, 2));
			album.artistId = sqlite3_column_int(statement, 3);
			result.push_back(album);
			
			rtc = sqlite3_step(statement);
		}
		// finish array
		sqlite3_finalize(statement);
		return ErrorCode::OK;
	}
	else {
		return ErrorCode::MALFORMED_SQL;
	}
}

// one master method to create library for different entity types
//std::string SqliteHandler::LoadLibraryForPlayback(std::unordered_map<std::string, std::string>& params)
//{
//	sqlite3_stmt* statement;
//	std::stringstream ss;
//	std::string songSql = BuildSongViewSQL(params);
//
//	// begin library object
//	ss << '{';
//
//	// create songs
//	ss << QUOTES << "songs" << QUOTES << ':' << RunSongViewSQL(songSql);
//	ss << ',';
//
//	// create artists
//	std::string artistSql = "SELECT art.name AS artistName, art.id AS artistId, s.id AS songId FROM artist AS art INNER JOIN (";
//	artistSql += songSql;
//	artistSql += ") AS s ON art.id = s.artistId";
//	auto rtc = sqlite3_prepare_v2(GetDbHandle(), artistSql.c_str(), -1, &statement, NULL);
//	// begin artists
//	ss << QUOTES << "artists" << QUOTES << ':' << '[';
//	rtc = sqlite3_step(statement);
//	bool first = true;
//	while (SQLITE_ROW == rtc) {
//		// beginning of object
//		if (!first) {
//			ss << ',';
//		}
//		ss << '{';
//		AppendJSONString(ss, "artistName", sqlite3_column_text(statement, 0));
//		ss << ',';
//		AppendJSONInt(ss, "artistId", sqlite3_column_text(statement, 1));
//		ss << ',';
//		AppendJSONInt(ss, "songId", sqlite3_column_text(statement, 2));
//		// finish object
//		ss << '}';
//		rtc = sqlite3_step(statement);
//		first = false;
//	}
//	// end artists array
//	ss << ']' << ',';
//	sqlite3_finalize(statement);
//
//	// create genres
//	std::string genreSql = "SELECT g.name AS genreName, g.id AS genreId, s.id AS songId FROM genre AS g INNER JOIN (";
//	genreSql += songSql;
//	genreSql += ") AS s ON (s.genreId = g.id)";
//	rtc = sqlite3_prepare_v2(GetDbHandle(), genreSql.c_str(), -1, &statement, NULL);
//	// begin genres
//	ss << QUOTES << "genres" << QUOTES << ':' << '[';
//	rtc = sqlite3_step(statement);
//	first = true;
//	while (SQLITE_ROW == rtc) {
//		// beginning of object
//		if (!first) {
//			ss << ',';
//		}
//		ss << '{';
//		AppendJSONString(ss, "genreName", sqlite3_column_text(statement, 0));
//		ss << ',';
//		AppendJSONInt(ss, "genreId", sqlite3_column_text(statement, 1));
//		ss << ',';
//		AppendJSONInt(ss, "songId", sqlite3_column_text(statement, 2));
//		// finish object
//		ss << '}';
//		rtc = sqlite3_step(statement);
//		first = false;
//	}
//	// end genres array
//	ss << ']' << ',';
//	sqlite3_finalize(statement);
//
//	// create albums
//	std::string albumSql = "SELECT a.name AS albumName, a.id AS albumId, s.id AS songId FROM album AS a INNER JOIN (";
//	albumSql += songSql;
//	albumSql += ") AS s ON (s.albumId = a.id)";
//	rtc = sqlite3_prepare_v2(GetDbHandle(), albumSql.c_str(), -1, &statement, NULL);
//	// begin albums
//	ss << QUOTES << "albums" << QUOTES << ':' << '[';
//	rtc = sqlite3_step(statement);
//	first = true;
//	while (SQLITE_ROW == rtc) {
//		// beginning of object
//		if (!first) {
//			ss << ',';
//		}
//		ss << '{';
//		AppendJSONString(ss, "albumName", sqlite3_column_text(statement, 0));
//		ss << ',';
//		AppendJSONInt(ss, "albumId", sqlite3_column_text(statement, 1));
//		ss << ',';
//		AppendJSONInt(ss, "songId", sqlite3_column_text(statement, 2));
//		// finish object
//		ss << '}';
//		rtc = sqlite3_step(statement);
//		first = false;
//	}
//	// end genres array
//	ss << ']';
//	sqlite3_finalize(statement);
//
//	// finalize library object
//	ss << '}';
//
//	return ss.str();
//}

sqlite3* SqliteAPI::GetDbHandle() {
	if (!db_handle_) {
		// first check if database file exists
		if (!FileExists(database_name_)) {
			// create database
			CreateDatabase();
		}
		else {
			/*auto rtc = */sqlite3_open(database_name_.c_str(), &db_handle_);
		}
		// verify good structure
	}

	return db_handle_;
}

void SqliteAPI::CreateDatabase() {
	auto rtc = sqlite3_open(database_name_.c_str(), &db_handle_);
	auto sql = "CREATE TABLE artist(id INTEGER PRIMARY KEY ASC, name TEXT UNIQUE NOT NULL);"
		"CREATE TABLE genre(id INTEGER PRIMARY KEY ASC, name TEXT UNIQUE NOT NULL);"
		"CREATE TABLE album(id INTEGER PRIMARY KEY ASC, name TEXT NOT NULL, artistId INTEGER"
		"	CONSTRAINT fk_artist_album REFERENCES artist(id), CONSTRAINT uq_album_name_artist UNIQUE(name, artistId) ON CONFLICT IGNORE);"
		"CREATE TABLE song(id INTEGER PRIMARY KEY ASC, title TEXT, artistId INTEGER CONSTRAINT fk_artist_song REFERENCES artist(id),"
		"	albumId INTEGER CONSTRAINT fk_album_song REFERENCES album(id), genreId INTEGER CONSTRAINT fk_genre_song REFERENCES genre(id),"
		"	length INTEGER, path TEXT UNIQUE NOT NULL);"
		"CREATE TABLE variables(name TEXT PRIMARY KEY NOT NULL, intValue INTEGER, textValue TEXT);"
		"CREATE TABLE playlist(id INTEGER PRIMARY KEY ASC, name TEXT NOT NULL, description TEXT, userId TEXT NOT NULL,"
		"	CONSTRAINT uq_playlist UNIQUE(name, userId) ON CONFLICT IGNORE);"
		"CREATE TABLE playlistSong(songId INTEGER NOT NULL CONSTRAINT fk_song_playlistSong REFERENCES song(id) ON DELETE CASCADE,"
		"	playlistId INTEGER NOT NULL CONSTRAINT fk_playlist_playlistSong REFERENCES playlist(id) ON DELETE CASCADE,"
		"	CONSTRAINT pk_playlistSong PRIMARY KEY(songId, playlistId) ON CONFLICT IGNORE);"
		"CREATE INDEX ix_playlistId_playlistSong ON playlistSong(playlistId);"
		"CREATE INDEX ix_userId_playlist ON playlist(userId);"
		"CREATE VIEW songView AS SELECT s.id, s.title, s.length, s.path, s.artistId, s.genreId, s.albumId,"
		"	CASE WHEN s.artistId IS NULL THEN NULL ELSE a.name END AS artist,"
		"	CASE WHEN s.albumId IS NULL THEN NULL ELSE alb.name END AS album,"
		"	CASE WHEN s.genreId IS NULL THEN NULL ELSE g.name END AS genre"
		"	FROM song AS s LEFT JOIN artist AS a ON(s.artistId = a.id) LEFT JOIN album AS alb ON(s.albumId = alb.id) LEFT JOIN genre AS g ON(s.genreId = g.id);"
		"CREATE VIEW albumView AS SELECT alb.id, alb.name, alb.artistId, CASE WHEN alb.artistId IS NULL THEN NULL ELSE a.name END AS artist"
		"	FROM album AS alb LEFT JOIN artist AS a ON (alb.artistId = a.id);";
	sqlite3_stmt* statement;
	while (strlen(sql) > 0) {
		rtc = sqlite3_prepare_v2(db_handle_, sql, -1, &statement, &sql);
		if (rtc != SQLITE_OK) {
			// sql error
		}
		rtc = sqlite3_step(statement);
		if (rtc != SQLITE_DONE) {
			// should not occur
		}
		rtc = sqlite3_finalize(statement);
		if (rtc != SQLITE_OK) {
			// error destroying statement
		}
	}
}

void SqliteAPI::AddFiles() {
	char const * lFilterPatterns[4] = { "*.mp3", "*.ogg", "*.aac", "*.wav" };
	char const * lTheOpenFileName = NULL;
	lTheOpenFileName = tinyfd_openFileDialog(
		"Add audio files",
		"",
		4,
		lFilterPatterns,
		"Audio files",
		1);
	if (lTheOpenFileName) {
		AudioInspector inspector;
		std::stringstream ss;
		const char *chr = lTheOpenFileName;
		while (*chr != '\0') {
			if (*chr == '|') {
				SongMetadata song;
				if (inspector.GetMetadata(ss.str().c_str(), &song)) {
					AddSongToDatabase(ss.str().c_str(), song);
				}
				ss.clear();
				ss.str(std::string());
			}
			else {
				ss << *chr;
			}
			++chr;
		}
		if (ss.str().size() > 0) {
			SongMetadata song;
			inspector.GetMetadata(ss.str().c_str(), &song);
			AddSongToDatabase(ss.str().c_str(), song);
		}
	}
}

void SqliteAPI::AddSongToDatabase(const char *filename, SongMetadata& metadata) {
	if (filename) {
		sqlite3_stmt *statement;
		std::string sql;
		int rtc = 0;
		int artistId, genreId, albumId;
		artistId = albumId = genreId = -1;

		if (metadata.artist.size() > 0) {
			// insert artist into db
			sql = "INSERT OR IGNORE INTO artist(name) VALUES('" + metadata.artist + "')";
			rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			rtc = sqlite3_step(statement);
			rtc = sqlite3_finalize(statement);
			// fetch artistId
			sql = "SELECT id FROM artist WHERE name = '" + metadata.artist + "'";
			rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			rtc = sqlite3_step(statement);
			if (rtc == SQLITE_ROW) {
				artistId = sqlite3_column_int(statement, 0);
			}
			rtc = sqlite3_finalize(statement);

			// we have an artist so we can try add album
			if (metadata.album.size() > 0) {
				// insert album into db
				sql = "INSERT OR IGNORE INTO album(artistId, name) VALUES (" + std::to_string(artistId) + ", '" + metadata.album + "')";
				rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
				rtc = sqlite3_step(statement);
				rtc = sqlite3_finalize(statement);
				// fetch albumId
				sql = "SELECT id FROM album WHERE name = '" + metadata.album + "' AND artistId = " + std::to_string(artistId);
				rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
				rtc = sqlite3_step(statement);
				if (rtc == SQLITE_ROW) {
					albumId = sqlite3_column_int(statement, 0);
				}
				rtc = sqlite3_finalize(statement);
			}
		}
		if (metadata.genre.size() > 0) {
			// insert genre into db
			sql = "INSERT OR IGNORE INTO genre(name) VALUES('" + metadata.genre + "')";
			rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			rtc = sqlite3_step(statement);
			rtc = sqlite3_finalize(statement);
			// fetch genreId
			sql = "SELECT id FROM genre WHERE name = '" + metadata.genre + "'";
			rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			rtc = sqlite3_step(statement);
			if (rtc == SQLITE_ROW) {
				genreId = sqlite3_column_int(statement, 0);
			}
			rtc = sqlite3_finalize(statement);
		}
		// now insert song
		std::stringstream ss;
		ss << "INSERT OR IGNORE INTO song(title, artistId, albumId, genreId, length, path) VALUES(";
		ss << "'" << metadata.title << "',";
		artistId > 0 ? ss << artistId : ss << "NULL";
		ss << ",";
		albumId > 0 ? ss << albumId : ss << "NULL";
		ss << ",";
		genreId > 0 ? ss << genreId : ss << "NULL";
		ss << ",";
		ss << metadata.duration;
		ss << ",";
		ss << "'" << filename << "'";
		ss << ")";
		sql = ss.str();
		rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
		rtc = sqlite3_step(statement);
		rtc = sqlite3_finalize(statement);
	}
}

SqliteAPI::ErrorCode SqliteAPI::AddPlaylist(const std::string& userId, const std::string& name, const std::string& description, SqliteAPI::PlaylistResult& result) {
	if (userId.empty() || name.empty()) {
		return ErrorCode::ARGUMENT_ERROR;
	}
	sqlite3_stmt* statement;
	std::stringstream ss;
	ss << "INSERT INTO playlist(name, userId, description) VALUES(";
	// fill values
	ss << '\'' << name << "',";
	ss << '\'' << userId << "',";
	if (description.empty()) {
		ss << "NULL";
	}
	else {
		ss << '\'' << description << '\'';
	}
	ss << ')';
	std::string sql = ss.str();

	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		if (rtc == SQLITE_DONE) {
			sqlite3_finalize(statement);

			std::unordered_map<std::string, std::string> params;
			params["userId"] = userId;
			params["name"] = name;
			std::vector<PlaylistResult> newPlaylist;
			auto errCode = Playlists(params, 1, 1, false, newPlaylist);
			if (errCode == ErrorCode::OK && newPlaylist.size() == 1) {
				result = newPlaylist[0];
			}
			return ErrorCode::OK;
		}
	}
	// no success
	return ErrorCode::DATABASE_ERROR;
}

SqliteAPI::ErrorCode SqliteAPI::ModifyPlaylist(const SqliteAPI::PlaylistResult& changes, bool nameChange, bool descriptionChange, SqliteAPI::PlaylistResult& result) {
	if (changes.userId.empty() || changes.id == 0 || (nameChange && changes.name.empty())) {
		return ErrorCode::ARGUMENT_ERROR;
	}

	// verify playlist exists
	std::unordered_map<std::string, std::string> params;
	params["userId"] = changes.userId;
	params["id"] = changes.id;
	std::vector<PlaylistResult> v_playlist;
	auto errCode = Playlists(params, 1, 1, false, v_playlist);
	if (errCode == ErrorCode::OK && v_playlist.size() == 1) {

		if (nameChange || descriptionChange) {			
			std::stringstream ss;
			ss << "UPDATE playlist SET ";
			// fill values
			if (nameChange) {
				ss << "name = '" << changes.name << '\'';
				if (descriptionChange) {
					ss << ',';
				}
			}
			if (descriptionChange) {
				ss << "description = '" << changes.description << '\'';
			}
			ss << " WHERE id = " << changes.id;
			std::string sql = ss.str();

			sqlite3_stmt* statement;
			auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			if (rtc == SQLITE_OK) {
				rtc = sqlite3_step(statement);
				if (rtc == SQLITE_DONE) {
					sqlite3_finalize(statement);

					v_playlist.clear();
					errCode = Playlists(params, 1, 1, false, v_playlist);
					if (errCode == ErrorCode::OK && v_playlist.size() == 1) {
						result = v_playlist[0];
						return ErrorCode::OK;
					}
					else {
						return ErrorCode::DATABASE_ERROR;
					}
				}
				else {
					return ErrorCode::DATABASE_ERROR;
				}
			}
			else {
				return ErrorCode::MALFORMED_SQL;
			}
		}
	}
	else {
		return ErrorCode::ARGUMENT_ERROR;
	}
	
	// no success
	return ErrorCode::DATABASE_ERROR;
}

SqliteAPI::ErrorCode SqliteAPI::RemovePlaylist(const std::uint32_t playlistId, const std::string& userId) {
	if (userId.empty() || playlistId == 0) {
		return ErrorCode::ARGUMENT_ERROR;
	}

	std::stringstream ss;
	ss << "DELETE FROM playlist WHERE id=" << playlistId << " AND userId='" << userId << '\'';
	std::string sql = ss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		if (rtc == SQLITE_DONE) {
			sqlite3_finalize(statement);			
			return ErrorCode::OK;
		}
		else {
			return ErrorCode::DATABASE_ERROR;
		}
	}
	else {
		return ErrorCode::MALFORMED_SQL;
	}
}

SqliteAPI::ErrorCode SqliteAPI::ModifyPlaylistSongs(std::uint32_t playlistId, const std::string& userId, std::vector<std::uint32_t>& add, std::vector<std::uint32_t>& remove) {
	// verify that playlist exists for user
	std::unordered_map<std::string, std::string> params;
	params["userId"] = userId;
	params["id"] = playlistId;
	std::vector<PlaylistResult> playlist;
	auto errCode = Playlists(params, 1, 1, false, playlist);
	if (errCode == ErrorCode::OK && playlist.size() == 1) {
		// TODO: maybe enclose in a transaction if possible?
		errCode = AddSongsToPlaylist(playlistId, add);
		if (errCode == ErrorCode::OK) {
			errCode = RemoveSongsFromPlaylist(playlistId, remove);
			return errCode;
		}
		else {
			return ErrorCode::DATABASE_ERROR;
		}
	}
	return ErrorCode::ARGUMENT_ERROR;
}

SqliteAPI::ErrorCode SqliteAPI::AddSongsToPlaylist(std::uint32_t playlistId, std::vector<std::uint32_t>& add) {	
	std::stringstream ss;
	ss << "INSERT OR IGNORE INTO playlistSong(playlistId, songId) VALUES ";	
	bool first = true;
	for (size_t i = 0; i < add.size(); i++)
	{
		// append value
		if (first) {
			first = false;
		}
		else {
			ss << ',';
		}
		ss << '(' << playlistId << ',' << add[i] << ')';
	}
	std::string sql = ss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		if (rtc == SQLITE_DONE) {
			// success
			return ErrorCode::OK;
		}
		else {
			return ErrorCode::DATABASE_ERROR;
		}
	}
	// no success
	return ErrorCode::MALFORMED_SQL;
}

SqliteAPI::ErrorCode SqliteAPI::RemoveSongsFromPlaylist(std::uint32_t playlistId, std::vector<std::uint32_t>& remove) {	
	std::stringstream ss;
	ss << "DELETE FROM playlistSong WHERE playlistId =" << playlistId << "AND songId IN (";
	bool first = true;
	for (size_t i = 0; i < remove.size(); i++)
	{
		// append songIds
		if (first) {
			first = false;
		}
		else {
			ss << ',';
		}
		ss << remove[i];
	}
	ss << ')';
	std::string sql = ss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		if (rtc == SQLITE_DONE) {
			// success
			return ErrorCode::OK;
		}
		else {
			return ErrorCode::DATABASE_ERROR;
		}
	}
	// no success
	return ErrorCode::MALFORMED_SQL;
}

std::string SqliteAPI::TextFieldToString(const unsigned char *field) {
	if (field != nullptr) {
		return std::string(reinterpret_cast<const char *>(field));
	}
	return std::string();
}

bool SqliteAPI::FileExists(const std::string& filename)
{
	std::ifstream ifile(filename);
	return ifile.good();
}
