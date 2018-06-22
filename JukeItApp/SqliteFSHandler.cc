#include "SqliteFSHandler.h"
#include <sstream>

const char * SqliteFSHandler::DATABASE_NAME_ = "data.dat";

SqliteFSHandler::~SqliteFSHandler() {
	if (db_handle_) {
		sqlite3_close_v2(db_handle_);
	}
}

std::string SqliteHandler::LoadGenres(std::unordered_map<std::string, std::string>& params) {
	sqlite3_stmt* statement;
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
	}
	std::string sql = ss.str();
	ss.clear();
	ss.str(std::string());

	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);

	// begin array
	ss << '[';
	rtc = sqlite3_step(statement);
	bool first = true;
	while (SQLITE_ROW == rtc) {
		// beginning of object
		if (!first) {
			ss << ',';
		}
		ss << '{';
		// append id
		AppendJSONInt(ss, "id", sqlite3_column_text(statement, 0));
		//append name
		ss << ',';
		AppendJSONString(ss, "name", sqlite3_column_text(statement, 1));
		// finish object
		ss << '}';
		rtc = sqlite3_step(statement);
		first = false;
	}
	// end array
	ss << ']';
	sqlite3_finalize(statement);

	return ss.str();
}

std::string SqliteHandler::LoadArtists(std::unordered_map<std::string, std::string>& params) {
	sqlite3_stmt* statement;
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
	}
	std::string sql = ss.str();
	ss.clear();
	ss.str(std::string());

	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);

	// begin array
	ss << '[';
	rtc = sqlite3_step(statement);
	bool first = true;
	while (SQLITE_ROW == rtc) {
		// beginning of object
		if (!first) {
			ss << ',';
		}
		ss << '{';
		// append id
		AppendJSONInt(ss, "id", sqlite3_column_text(statement, 0));
		//append name
		ss << ',';
		AppendJSONString(ss, "name", sqlite3_column_text(statement, 1));
		// finish object
		ss << '}';
		rtc = sqlite3_step(statement);
		first = false;
	}
	// end array
	ss << ']';
	sqlite3_finalize(statement);
	return ss.str();
}

std::string SqliteHandler::LoadPlaylists(std::unordered_map<std::string, std::string>& params) {
	sqlite3_stmt* statement;
	std::stringstream ss;
	ss << "SELECT id, name, description, usr FROM playlist";
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
	}
	std::string sql = ss.str();
	ss.clear();
	ss.str(std::string());

	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);

	// begin array
	ss << '[';
	rtc = sqlite3_step(statement);
	bool first = true;
	while (SQLITE_ROW == rtc) {
		// beginning of object
		if (!first) {
			ss << ',';
		}
		ss << '{';
		AppendJSONInt(ss, "id", sqlite3_column_text(statement, 0));
		ss << ',';
		AppendJSONString(ss, "name", sqlite3_column_text(statement, 1));
		ss << ',';
		AppendJSONString(ss, "description", sqlite3_column_text(statement, 2));
		ss << ',';
		AppendJSONString(ss, "usr", sqlite3_column_text(statement, 3));
		// finish object
		ss << '}';
		rtc = sqlite3_step(statement);
		first = false;
	}
	// end array
	ss << ']';
	sqlite3_finalize(statement);
	return ss.str();
}

SqliteFSHandler::ResponseCode SqliteFSHandler::SongView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t page, bool desc, web::json::value& response) {
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

		// add ORDER BY clause
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
		std::vector<web::json::value> resultSet;
		utility::stringstream_t converter;
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			std::vector<std::pair<utility::string_t, web::json::value>> fields;

			fields.push_back(std::make_pair(U("id"), web::json::value::number(sqlite3_column_int(statement, 0))));

			converter << sqlite3_column_text(statement, 1);
			fields.push_back(std::make_pair(U("title"), web::json::value::string(converter.str())));
			converter.clear();
			converter.str(utility::string_t());			
			
			converter << sqlite3_column_text(statement, 2);
			fields.push_back(std::make_pair(U("artist"), web::json::value::string(converter.str())));
			converter.clear();
			converter.str(utility::string_t());

			converter << sqlite3_column_text(statement, 3);
			fields.push_back(std::make_pair(U("album"), web::json::value::string(converter.str())));
			converter.clear();
			converter.str(utility::string_t());

			converter << sqlite3_column_text(statement, 4);
			fields.push_back(std::make_pair(U("genre"), web::json::value::string(converter.str())));
			converter.clear();
			converter.str(utility::string_t());

			fields.push_back(std::make_pair(U("duration"), web::json::value::number(sqlite3_column_int(statement, 5))));

			fields.push_back(std::make_pair(U("artistId"), web::json::value::number(sqlite3_column_int(statement, 6))));

			fields.push_back(std::make_pair(U("albumId"), web::json::value::number(sqlite3_column_int(statement, 7))));

			fields.push_back(std::make_pair(U("genreId"), web::json::value::number(sqlite3_column_int(statement, 8))));

			resultSet.push_back(web::json::value::object(fields, true));
			// fetch next row
			rtc = sqlite3_step(statement);
		}		
		sqlite3_finalize(statement);

		response = web::json::value::array(resultSet);
		return ResponseCode::CODE_200_OK;
	}
	return ResponseCode::CODE_500_INTERNAL_SERVER_ERROR;
}

std::string SqliteHandler::AlbumView(std::unordered_map<std::string, std::string>& params) {
	sqlite3_stmt* statement;
	std::stringstream ss;
	ss << "SELECT id, name, artistId, artist FROM albumView";
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
	}
	std::string sql = ss.str();
	ss.clear();
	ss.str(std::string());
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		bool first = true;
		// begin array
		ss << '[';
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			if (first) {
				first = false;
			}
			else {
				ss << ',';
			}
			ss << '{';
			AppendJSONInt(ss, "id", sqlite3_column_text(statement, 0));
			ss << ',';
			AppendJSONString(ss, "name", sqlite3_column_text(statement, 1));
			ss << ',';
			AppendJSONInt(ss, "artistId", sqlite3_column_text(statement, 2));
			ss << ',';
			AppendJSONString(ss, "artist", sqlite3_column_text(statement, 3));
			ss << '}';
			// fetch next row
			rtc = sqlite3_step(statement);
		}
		// finish array
		ss << ']';
		sqlite3_finalize(statement);
		return ss.str();
	}
	return std::string();
}

// one master method to create library for different entity types
std::string SqliteHandler::LoadLibraryForPlayback(std::unordered_map<std::string, std::string>& params)
{
	sqlite3_stmt* statement;
	std::stringstream ss;
	std::string songSql = BuildSongViewSQL(params);

	// begin library object
	ss << '{';

	// create songs
	ss << QUOTES << "songs" << QUOTES << ':' << RunSongViewSQL(songSql);
	ss << ',';

	// create artists
	std::string artistSql = "SELECT art.name AS artistName, art.id AS artistId, s.id AS songId FROM artist AS art INNER JOIN (";
	artistSql += songSql;
	artistSql += ") AS s ON art.id = s.artistId";
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), artistSql.c_str(), -1, &statement, NULL);
	// begin artists
	ss << QUOTES << "artists" << QUOTES << ':' << '[';
	rtc = sqlite3_step(statement);
	bool first = true;
	while (SQLITE_ROW == rtc) {
		// beginning of object
		if (!first) {
			ss << ',';
		}
		ss << '{';
		AppendJSONString(ss, "artistName", sqlite3_column_text(statement, 0));
		ss << ',';
		AppendJSONInt(ss, "artistId", sqlite3_column_text(statement, 1));
		ss << ',';
		AppendJSONInt(ss, "songId", sqlite3_column_text(statement, 2));
		// finish object
		ss << '}';
		rtc = sqlite3_step(statement);
		first = false;
	}
	// end artists array
	ss << ']' << ',';
	sqlite3_finalize(statement);

	// create genres
	std::string genreSql = "SELECT g.name AS genreName, g.id AS genreId, s.id AS songId FROM genre AS g INNER JOIN (";
	genreSql += songSql;
	genreSql += ") AS s ON (s.genreId = g.id)";
	rtc = sqlite3_prepare_v2(GetDbHandle(), genreSql.c_str(), -1, &statement, NULL);
	// begin genres
	ss << QUOTES << "genres" << QUOTES << ':' << '[';
	rtc = sqlite3_step(statement);
	first = true;
	while (SQLITE_ROW == rtc) {
		// beginning of object
		if (!first) {
			ss << ',';
		}
		ss << '{';
		AppendJSONString(ss, "genreName", sqlite3_column_text(statement, 0));
		ss << ',';
		AppendJSONInt(ss, "genreId", sqlite3_column_text(statement, 1));
		ss << ',';
		AppendJSONInt(ss, "songId", sqlite3_column_text(statement, 2));
		// finish object
		ss << '}';
		rtc = sqlite3_step(statement);
		first = false;
	}
	// end genres array
	ss << ']' << ',';
	sqlite3_finalize(statement);

	// create albums
	std::string albumSql = "SELECT a.name AS albumName, a.id AS albumId, s.id AS songId FROM album AS a INNER JOIN (";
	albumSql += songSql;
	albumSql += ") AS s ON (s.albumId = a.id)";
	rtc = sqlite3_prepare_v2(GetDbHandle(), albumSql.c_str(), -1, &statement, NULL);
	// begin albums
	ss << QUOTES << "albums" << QUOTES << ':' << '[';
	rtc = sqlite3_step(statement);
	first = true;
	while (SQLITE_ROW == rtc) {
		// beginning of object
		if (!first) {
			ss << ',';
		}
		ss << '{';
		AppendJSONString(ss, "albumName", sqlite3_column_text(statement, 0));
		ss << ',';
		AppendJSONInt(ss, "albumId", sqlite3_column_text(statement, 1));
		ss << ',';
		AppendJSONInt(ss, "songId", sqlite3_column_text(statement, 2));
		// finish object
		ss << '}';
		rtc = sqlite3_step(statement);
		first = false;
	}
	// end genres array
	ss << ']';
	sqlite3_finalize(statement);

	// finalize library object
	ss << '}';

	return ss.str();
}

sqlite3* SqliteFSHandler::GetDbHandle() {
	if (!db_handle_) {
		// first check if database file exists
		if (!FileExists(DATABASE_NAME_)) {
			// create database
			CreateDatabase();
		}
		else {
			/*auto rtc = */sqlite3_open(DATABASE_NAME_, &db_handle_);
		}
		// verify good structure
	}

	return db_handle_;
}

void SqliteFSHandler::CreateDatabase() {
	auto rtc = sqlite3_open(DATABASE_NAME_, &db_handle_);
	auto sql = "CREATE TABLE artist(id INTEGER PRIMARY KEY ASC, name TEXT UNIQUE NOT NULL);"
		"CREATE TABLE genre(id INTEGER PRIMARY KEY ASC, name TEXT UNIQUE NOT NULL);"
		"CREATE TABLE album(id INTEGER PRIMARY KEY ASC, name TEXT NOT NULL, artistId INTEGER"
		"	CONSTRAINT fk_artist_album REFERENCES artist(id), CONSTRAINT uq_album_name_artist UNIQUE(name, artistId) ON CONFLICT IGNORE);"
		"CREATE TABLE song(id INTEGER PRIMARY KEY ASC, title TEXT, artistId INTEGER CONSTRAINT fk_artist_song REFERENCES artist(id),"
		"	albumId INTEGER CONSTRAINT fk_album_song REFERENCES album(id), genreId INTEGER CONSTRAINT fk_genre_song REFERENCES genre(id),"
		"	length INTEGER, path TEXT UNIQUE NOT NULL);"
		"CREATE TABLE variables(name TEXT PRIMARY KEY NOT NULL, intValue INTEGER, textValue TEXT);"
		"CREATE TABLE playlist(id INTEGER PRIMARY KEY ASC, name TEXT NOT NULL, description TEXT, usr TEXT NOT NULL,"
		"	CONSTRAINT uq_playlist UNIQUE(name, usr) ON CONFLICT IGNORE);"
		"CREATE TABLE playlistSong(songId INTEGER NOT NULL CONSTRAINT fk_song_playlistSong REFERENCES song(id) ON DELETE CASCADE,"
		"	playlistId INTEGER NOT NULL CONSTRAINT fk_playlist_playlistSong REFERENCES playlist(id) ON DELETE CASCADE,"
		"	CONSTRAINT pk_playlistSong PRIMARY KEY(songId, playlistId) ON CONFLICT IGNORE);"
		"CREATE INDEX ix_playlistId_playlistSong ON playlistSong(playlistId);"
		"CREATE INDEX ix_usr_playlist ON playlist(usr);"
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

void SqliteHandler::AddFiles() {
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

void SqliteHandler::AddSongToDatabase(const char *filename, SongMetadata& metadata) {
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

void SqliteHandler::AddPlaylist(std::unordered_map<std::string, std::string>& params) {
	sqlite3_stmt* statement;
	std::stringstream ss;
	ss << "INSERT INTO playlist(name, description, usr) VALUES(";
	// fill values
	auto it = params.find("name");
	if (it != params.end()) {
		ss << '\'' << it->second << '\'';
	}
	else {
		ss << "NULL";
	}
	ss << ',';

	it = params.find("description");
	if (it != params.end()) {
		ss << '\'' << it->second << '\'';
	}
	else {
		ss << "NULL";
	}
	ss << ',';

	it = params.find("usr");
	if (it != params.end()) {
		ss << '\'' << it->second << '\'';
	}
	else {
		ss << "NULL";
	}
	ss << ")";
	std::string sql = ss.str();
	ss.clear();
	ss.str(std::string());

	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		if (rtc == SQLITE_DONE) {
			// success
			return;
		}
	}
	// no success
	return;
}

void SqliteHandler::AddSongToPlaylist(std::unordered_map<std::string, std::string>& params) {
	sqlite3_stmt* statement;
	std::stringstream ss;
	ss << "INSERT INTO playlistSong(playlistId, songId) VALUES ";

	auto it = params.find("playlistId");
	if (it != params.end()) {
		auto playlistId = it->second;

		it = params.find("songs");
		if (it != params.end()) {
			// parse song IDs
			std::stringstream id;
			bool first = true;
			for (auto i = it->second.begin(); i != it->second.end(); i++)
			{
				if (isdigit(*i)) {
					id << *i;
				}
				else if (*i == ',') {
					if (id.str().length() > 0) {
						// append value
						if (first) {
							first = false;
						}
						else {
							ss << ',';
						}
						ss << '(' << playlistId << ',' << id.str() << ')';
						id.clear();
						id.str(std::string());
					}
				}
			}
			if (id.str().length() > 0) {
				// append value
				if (first) {
					first = false;
				}
				else {
					ss << ',';
				}
				ss << '(' << playlistId << ',' << id.str() << ')';
				id.clear();
				id.str(std::string());
			}
			std::string sql = ss.str();

			auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			if (rtc == SQLITE_OK) {
				rtc = sqlite3_step(statement);
				if (rtc == SQLITE_DONE) {
					// success
					return;
				}
			}
			// no success
			return;
		}
		else {
			// TODO: report missing param
			return;
		}
	}
	else {
		// report missing param
		return;
	}
}
