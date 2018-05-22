#include "sqlite_handler.h"
#include <sstream>

const char * SqliteHandler::DATABASE_NAME_ = "data.dat";

SqliteHandler::SqliteHandler(const CefString& startup_url)
	: startup_url_(startup_url) {
	//auto rtc = sqlite3_open(DATABASE_NAME_, &db_handle_);
	//if (rtc != SQLITE_OK) {
	//	//TODO: an issue occured
	//}
}

SqliteHandler::~SqliteHandler() {
	if (db_handle_) {
		sqlite3_close_v2(db_handle_);
	}
}

SqliteHandler::CommandName SqliteHandler::GetCommandName(const std::string & command)
{
	if (StartsWith(command, "SQL")) {
		if (StartsWith(command, "SQL_LOAD_GENRES")) {
			return CommandName::LOAD_GENRES;
		}
		else if (StartsWith(command, "SQL_LOAD_ARTISTS")) {
			return CommandName::LOAD_ARTISTS;
		}
		else if (StartsWith(command, "SQL_LOAD_ALBUMS")) {
			return CommandName::LOAD_ALBUMS;
		}
		else if (StartsWith(command, "SQL_LOAD_SONGS")) {
			return CommandName::LOAD_SONGS;
		}
		else if (StartsWith(command, "SQL_LOAD_LIBRARY")) {
			return CommandName::LOAD_LIBRARY;
		}
		else if (StartsWith(command, "SQL_SONGVIEW_BY_ID")) {
			return CommandName::SONGVIEW_BY_ID;
		}
		else {
			return CommandName::NOT_SUPPORTED;
		}
	}
	else {
		return CommandName::NOT_SUPPORTED;
	}
}

	// Called due to cefQuery execution in message_router.html.
bool SqliteHandler::OnQuery(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	int64 query_id,
	const CefString& request,
	bool persistent,
	CefRefPtr<Callback> callback) {
	// Only handle messages from the startup URL.
	const std::string& url = frame->GetURL();
	if (url.find(startup_url_) != 0)
		return false;

	const std::string& message_name = request;
	CommandName command = GetCommandName(message_name);

	if (command == CommandName::NOT_SUPPORTED) {
		return false;
	}

	switch (command) {
	case CommandName::LOAD_GENRES: {
		std::string result = LoadGenres();
		callback->Success(result);
		return true;
	}
	case CommandName::LOAD_ARTISTS: {
		std::string result = LoadArtists();
		callback->Success(result);
		return true;
	}
	case CommandName::LOAD_ALBUMS: {
		std::string result = LoadAlbums();
		callback->Success(result);
		return true;
	}
	case CommandName::LOAD_SONGS: {
		std::string result = LoadSongs();
		callback->Success(result);
		return true;
	}
	case CommandName::LOAD_LIBRARY: {
		auto params = GetParams(message_name);
		std::string result = LoadLibraryForPlayback(params);
		callback->Success(result);
		return true;
	}
	case CommandName::SONGVIEW_BY_ID: {
		auto params = GetParams(message_name);
		std::string result = SongviewById(params);
		callback->Success(result);
		return true;
	}

	}
	return false;
}

std::string SqliteHandler::LoadGenres() {	
	AddFiles();


	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), "SELECT id, name FROM genre", -1, &statement, NULL);
	std::stringstream ss;
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

std::string SqliteHandler::LoadArtists() {
	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), "SELECT id, name FROM artist", -1, &statement, NULL);
	std::stringstream ss;
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

std::string SqliteHandler::LoadAlbums() {
	sqlite3_stmt* statement;
	auto sql = "SELECT alb.id, alb.name, a.name AS artistName FROM album AS alb INNER JOIN artist AS a ON(alb.artistId = a.id)";
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
	std::stringstream ss;
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
		// append artistName
		ss << ',';
		AppendJSONString(ss, "artistName", sqlite3_column_text(statement, 2));
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

std::string SqliteHandler::LoadSongs() {
	sqlite3_stmt* statement;
	auto sql = "SELECT id, title, length, path, artist, album, genre FROM songView";	
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
	std::stringstream ss;
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
		//append title
		ss << ',';
		AppendJSONString(ss, "title", sqlite3_column_text(statement, 1));
		// append length
		ss << ',';
		AppendJSONInt(ss, "length", sqlite3_column_text(statement, 2));
		// append path
		ss << ',';
		AppendJSONString(ss, "path", sqlite3_column_text(statement, 3));
		// append artist
		ss << ',';
		AppendJSONString(ss, "artist", sqlite3_column_text(statement, 4));
		// append album
		ss << ',';
		AppendJSONString(ss, "album", sqlite3_column_text(statement, 5));
		// append genre
		ss << ',';
		AppendJSONString(ss, "genre", sqlite3_column_text(statement, 6));
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

std::string SqliteHandler::SongviewById(std::unordered_map<std::string, std::string>& params) {
	sqlite3_stmt* statement;
	if (params.size() > 0) {
		auto itId = params.find("id");
		if (itId != params.end()) {
			auto sql = std::string("SELECT id, title, length, path, artist, album, genre FROM songView");
			sql += " WHERE id = " + itId->second;
			auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			std::stringstream ss;
			// begin object
			ss << '{';
			rtc = sqlite3_step(statement);
			if (SQLITE_ROW == rtc) {
				// append id
				AppendJSONInt(ss, "id", sqlite3_column_text(statement, 0));
				//append title
				ss << ',';
				AppendJSONString(ss, "title", sqlite3_column_text(statement, 1));
				// append length
				ss << ',';
				AppendJSONInt(ss, "length", sqlite3_column_text(statement, 2));
				// append path
				ss << ',';
				AppendJSONString(ss, "path", sqlite3_column_text(statement, 3));
				// append artist
				ss << ',';
				AppendJSONString(ss, "artist", sqlite3_column_text(statement, 4));
				// append album
				ss << ',';
				AppendJSONString(ss, "album", sqlite3_column_text(statement, 5));
				// append genre
				ss << ',';
				AppendJSONString(ss, "genre", sqlite3_column_text(statement, 6));
			}
			// finish object
			ss << '}';
			sqlite3_finalize(statement);
			return ss.str();
		}
	}
	return std::string();
}

// one master method to create library for different entity types
std::string SqliteHandler::LoadLibraryForPlayback(std::unordered_map<std::string, std::string>& params)
{
	sqlite3_stmt* statement;
	std::stringstream ss;
	std::string songSql = "SELECT s.id, s.title, s.artistId, s.albumId, s.genreId, s.length FROM song AS s";
	// first check our params
	if (params.size() == 1) {
		auto it = params.begin();
		if (it->first == "playlistId") {
			songSql += " INNER JOIN playlistSong AS ps ON s.id = ps.songId";
			songSql += " WHERE ps.playlistId = " + it->second;
		}
		else if (it->first == "artistId") {
			songSql += " WHERE s.artistId = " + it->second;
		}
		else if (it->first == "genreId") {
			songSql += " WHERE s.genreId = " + it->second;
		}
		else if (it->first == "albumId") {
			songSql += " WHERE s.albumId = " + it->second;
		}
	}
	// begin library object
	ss << '{';

	// create songs
	ss << QUOTES << "songs" << QUOTES << ':' << '[';
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), songSql.c_str(), -1, &statement, NULL);
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
		AppendJSONString(ss, "title", sqlite3_column_text(statement, 1));
		ss << ',';
		AppendJSONInt(ss, "artistId", sqlite3_column_text(statement, 2));
		ss << ',';
		AppendJSONInt(ss, "albumId", sqlite3_column_text(statement, 3));
		ss << ',';
		AppendJSONInt(ss, "genreId", sqlite3_column_text(statement, 4));
		ss << ',';
		AppendJSONInt(ss, "length", sqlite3_column_text(statement, 5));
		// finish object
		ss << '}';
		rtc = sqlite3_step(statement);
		first = false;
	}
	// end songs array
	ss << ']' << ',';
	sqlite3_finalize(statement);

	// create artists
	std::string artistSql = "SELECT art.name AS artistName, art.id AS artistId, s.id AS songId FROM artist AS art INNER JOIN (";
	artistSql += songSql;
	artistSql += ") AS s ON art.id = s.artistId";
	rtc = sqlite3_prepare_v2(GetDbHandle(), artistSql.c_str(), -1, &statement, NULL);
	// begin artists
	ss << QUOTES << "artists" << QUOTES << ':' << '[';
	rtc = sqlite3_step(statement);
	first = true;
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

sqlite3* SqliteHandler::GetDbHandle() {
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

void SqliteHandler::CreateDatabase() {
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
		"CREATE VIEW songView AS SELECT s.id, s.title, s.length, s.path, CASE WHEN s.artistId IS NULL THEN NULL ELSE a.name END AS artist,"
		"	CASE WHEN s.albumId IS NULL THEN NULL ELSE alb.name END AS album, CASE WHEN s.genreId IS NULL THEN NULL ELSE g.name END AS genre"
		"	FROM song AS s LEFT JOIN artist AS a ON(s.artistId = a.id) LEFT JOIN album AS alb ON(s.albumId = alb.id) LEFT JOIN genre AS g ON(s.genreId = g.id)";
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
		artistId > 0 ? ss << artistId : ss << "NULL";
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
