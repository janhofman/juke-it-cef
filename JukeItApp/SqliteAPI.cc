#include "SqliteAPI.h"

const char * SqliteAPI::DATABASE_NAME = "data.dat";
const char * SqliteAPI::FILTER_PARAM = "filter";
const char * SqliteAPI::ORDERBY_PARAM = "orderby";
const char * SqliteAPI::ID_PARAM = "id";
const char * SqliteAPI::ALBUMID_PARAM = "albumId";
const char * SqliteAPI::ARTISTID_PARAM = "artistId";
const char * SqliteAPI::GENREID_PARAM = "genreId";
const char * SqliteAPI::USERID_PARAM = "userId";
const char * SqliteAPI::PLAYLISTID_PARAM = "playlistId";

SqliteAPI::SqliteAPI() : database_name_(DATABASE_NAME) {};

SqliteAPI::SqliteAPI(const std::string& fileName) : database_name_(fileName) {};

SqliteAPI::~SqliteAPI() {
	if (db_handle_) {
		sqlite3_close_v2(db_handle_);
	}
}

SqliteAPI::ErrorCode SqliteAPI::Genres(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<SqliteAPI::GenreResult>& result) {
	std::stringstream queryss;
	std::string orderBy = "name";
	std::string asc_desc = desc ? "DESC" : "ASC";
	std::uint32_t offset = start == 0 ? 0 : start - 1;

	// main query that will be repeated in pagination query
	std::string coreQuery = " FROM genre WHERE (id = @id OR @id IS NULL) AND (name LIKE '%' || @filter || '%' OR @filter IS NULL)";

	queryss << "SELECT id, name";
	queryss << coreQuery;
	if (offset > 0) {
		// pagination query
		queryss << " AND id NOT IN (SELECT id";
		queryss << coreQuery;
		queryss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
	}
	// pagination filter
	queryss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;
	std::string sql = queryss.str();	

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		// bind parameters
		if (params.size() > 0) {
			for (auto it = params.begin(); it != params.end(); it++)
			{
				if (it->first == ID_PARAM) {
					int id;
					if (TryParseInt(it->second, id)) {
						rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), id);
					}
				}
				else if (it->first == FILTER_PARAM && it->second.size() > 0) {
					rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@filter"), it->second.c_str(), -1, NULL);
				}
			}
		}
		// get data		
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

SqliteAPI::ErrorCode SqliteAPI::Artist(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<SqliteAPI::ArtistResult>& result) {
	std::stringstream queryss;
	std::string orderBy = "name";
	std::string asc_desc = desc ? "DESC" : "ASC";
	std::uint32_t offset = start == 0 ? 0 : start - 1;
	
	auto coreQuery = "FROM artist WHERE (id = @id OR @id IS NULL) AND (name LIKE '%' || @filter || '%' OR @filter IS NULL)";
	
	queryss << "SELECT id, name ";
	queryss << coreQuery;	
	if (offset > 0) {		
		// pagination query
		queryss << " AND id NOT IN (SELECT id " << coreQuery << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
	}
	// pagination filter
	queryss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;

	std::string sql = queryss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		if (params.size() > 0) {
			for (auto it = params.begin(); it != params.end(); it++)
			{
				if (it->first == ID_PARAM) {
					int id;
					if (TryParseInt(it->second, id)) {
						rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), id);
					}
				}
				else if (it->first == FILTER_PARAM && it->second.size() > 0) {
					rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@filter"), it->second.c_str(), -1, NULL);
				}
			}
		}

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

SqliteAPI::ErrorCode SqliteAPI::Playlists(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<SqliteAPI::PlaylistResult>& result) {
	std::stringstream queryss;
	std::string orderBy = "name";
	std::string asc_desc = desc ? "DESC" : "ASC";
	std::uint32_t offset = start == 0 ? 0 : start - 1;

	auto coreQuery = "FROM playlist WHERE (id = @id OR @id IS NULL) AND (name LIKE '%' || @filter || '%' OR @filter IS NULL)"
		" AND (name = @name OR @name IS NULL) AND userId = @userId";

	queryss << "SELECT id, name, description, userId ";
	queryss << coreQuery;	
	if (offset > 0) {
		// pagination query
		queryss << " AND id NOT IN (SELECT id " << coreQuery << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
	}
	// pagination filter
	queryss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;
	std::string sql = queryss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		if (params.size() > 0) {
			for (auto it = params.begin(); it != params.end(); it++)
			{
				if (it->first == ID_PARAM) {
					int id;
					if (TryParseInt(it->second, id)) {
						rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), id);
					}
				}
				else if (it->first == FILTER_PARAM && it->second.size() > 0) {
					rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@filter"), it->second.c_str(), -1, NULL);
				}
				else if (it->first == "name") {
					rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@name"), it->second.c_str(), -1, NULL);
				}
				else if (it->first == USERID_PARAM) {
					rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@userId"), it->second.c_str(), -1, NULL);
				}
			}
		}

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

SqliteAPI::ErrorCode SqliteAPI::SongView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<SqliteAPI::SongResult>& result) {
	std::string orderBy = "s.id";
	auto orderByIt = params.find(ORDERBY_PARAM);
	if (orderByIt != params.end()) {
		if (orderByIt->second == "title") {
			orderBy = "s.title";
		}
		else if (orderByIt->second == "artist") {
			orderBy = "s.artist";
		}
		else if (orderByIt->second == "album") {
			orderBy = "s.album";
		}
		else if (orderByIt->second == "genre") {
			orderBy = "s.genre";
		}
		else if (orderByIt->second == "duration") {
			orderBy = "s.length";
		}
	}
	std::string asc_desc = desc ? "DESC" : "ASC";
	std::uint32_t offset = start == 0 ? 0 : start - 1;
	
	auto coreQuery =  "FROM songView AS s LEFT JOIN playlistSong AS ps ON (ps.songId = s.id)"
		" WHERE (s.id = @id OR @id IS NULL) AND (s.title LIKE '%' || @filter || '%' OR @filter IS NULL)"
		" AND (s.artistId = @artistId OR @artistId IS NULL) AND (s.albumId = @albumId OR @albumId IS NULL)"
		" AND (s.genreId = @genreId OR @genreId IS NULL) AND (ps.playlistId = @playlistId OR @playlistId IS NULL)";
	
	std::stringstream queryss;
	queryss << "SELECT s.id, s.title, s.artist, s.album, s.genre, s.length, s.artistId, s.albumId, s.genreId ";
	queryss << coreQuery;
	if (offset > 0) {
		// pagination query
		queryss << " AND s.id NOT IN (SELECT s.id " << coreQuery << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
	}
	// pagination filter
	queryss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;

	std::string sql = queryss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		if (params.size() > 0) {
			for (auto it = params.begin(); it != params.end(); it++)
			{
				if (it->first == ID_PARAM
					|| it->first == ARTISTID_PARAM
					|| it->first == ALBUMID_PARAM
					|| it->first == GENREID_PARAM
					|| it->first == PLAYLISTID_PARAM
					) {
					int id;
					if (TryParseInt(it->second, id)) {
						auto paramName = std::string("@").append(it->first);
						rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, paramName.c_str()), id);
					}
				}
				else if (it->first == FILTER_PARAM && it->second.size() > 0) {
					rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@filter"), it->second.c_str(), -1, NULL);
				}
			}
		}

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

SqliteAPI::ErrorCode SqliteAPI::AlbumView(const std::unordered_map<std::string, std::string>& params, std::uint32_t limit, std::uint32_t start, bool desc, std::vector<SqliteAPI::AlbumResult>& result) {
	std::string orderBy = "artist, name";
	std::string asc_desc = desc ? "DESC" : "ASC";
	std::uint32_t offset = start == 0 ? 0 : start - 1;

	auto orderbyIt = params.find(ORDERBY_PARAM);
	if (orderbyIt != params.end() && orderbyIt->second == "name") {
		orderBy = "name";
	}

	auto coreQuery = "FROM albumView WHERE (id = @id OR @id IS NULL) AND (artistId = @artistId OR @artistId IS NULL)"
		" AND (name LIKE '%' || @filter || '%' OR @filter IS NULL)";

	std::stringstream queryss;
	queryss << "SELECT id, name, artist, artistId ";
	queryss << coreQuery;
	if (offset > 0) {
		// pagination query
		queryss << " AND id NOT IN (SELECT id " << coreQuery << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << offset << ")";
	}
	// pagination filter
	queryss << " ORDER BY " << orderBy << " " << asc_desc << " LIMIT " << limit;

	std::string sql = queryss.str();

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		if (params.size() > 0) {
			for (auto it = params.begin(); it != params.end(); it++)
			{
				if (it->first == ID_PARAM) {
					int id;
					if (TryParseInt(it->second, id)) {
						rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), id);
					}
				}
				else if (it->first == ARTISTID_PARAM) {
					int artistId;
					if (TryParseInt(it->second, artistId)) {
						rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@artistId"), artistId);
					}
				}
				else if (it->first == FILTER_PARAM && it->second.size() > 0) {
					rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@filter"), it->second.c_str(), -1, NULL);
				}
			}
		}

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

SqliteAPI::ErrorCode SqliteAPI::GetSongPath(const std::uint32_t songId, std::string& path) {
	
	auto sql = "SELECT path, notFound FROM song WHERE id = @id";
	auto errCode = ErrorCode::OK;

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), songId);
		rtc = sqlite3_step(statement);
		if (SQLITE_ROW == rtc) {
			path = TextFieldToString(sqlite3_column_text(statement, 0));

			// perform consistency check
			bool notFound = sqlite3_column_int(statement, 1) == 1;
			bool exists = std::filesystem::exists(path);
			if (exists && notFound) {
				// song was found
				SetSongNotFound(false, songId);
			}
			else if (!exists && !notFound) {
				// song is missing
				SetSongNotFound(true, songId);
			}

			errCode = ErrorCode::OK;
		}
		else {
			errCode = ErrorCode::NOT_FOUND;
		}
	}
	else {
		errCode = ErrorCode::MALFORMED_SQL;
	}
	sqlite3_finalize(statement);

	return errCode;
}

sqlite3* SqliteAPI::GetDbHandle() {
	std::lock_guard<std::mutex> guard(dbHandleMutex_);
	if (!db_handle_) {
		// first check if database file exists
		if (!std::filesystem::exists(database_name_)) {
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
		"CREATE INDEX ix_artist_album ON album(artistId);"
		"CREATE TABLE song(id INTEGER PRIMARY KEY ASC, title TEXT, artistId INTEGER CONSTRAINT fk_artist_song REFERENCES artist(id),"
		"	albumId INTEGER CONSTRAINT fk_album_song REFERENCES album(id), genreId INTEGER CONSTRAINT fk_genre_song REFERENCES genre(id),"
		"	length INTEGER, path TEXT UNIQUE NOT NULL, notFound BOOLEAN NOT NULL DEFAULT 0 CHECK (notFound IN (0,1)));"
		"CREATE INDEX ix_artist_song ON song(artistId);"
		"CREATE INDEX ix_album_song ON song(albumId);"
		"CREATE INDEX ix_genre_song ON song(genreId);"
		"CREATE INDEX ix_notFound_song ON song(notFound);"
		//"CREATE TABLE variables(name TEXT PRIMARY KEY NOT NULL, intValue INTEGER, textValue TEXT);"
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
	char const * lFilterPatterns[6] = { "*.mp3", "*.ogg", "*.aac", "*.wav", "*.m4a", "*.flac" };
	char const * lTheOpenFileName = NULL;
	lTheOpenFileName = tinyfd_openFileDialog(
		"Add audio files",
		"",
		6,
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

bool SqliteAPI::RemoveFiles(const std::vector<std::string>& remove) {
	bool isOk = BeginTransaction() == ErrorCode::OK;

	for (size_t i = 0; i < remove.size(); i++)
	{		
		isOk = isOk && RemoveSong(remove[i]);
		if (!isOk) {
			break;
		}
	}

	isOk = isOk && CleanUpAfterRemoval();

	if (isOk) {
		isOk = CommitTransaction() == ErrorCode::OK;
	}
	else {
		RollbackTransaction();
	}

	return isOk;	
}

bool SqliteAPI::RemoveFile(const std::string& songId) {
	bool isOk = BeginTransaction() == ErrorCode::OK;
	isOk = isOk && RemoveSong(songId);
	isOk = isOk && CleanUpAfterRemoval();
	if (isOk) {
		isOk = CommitTransaction() == ErrorCode::OK;
	}
	else {
		RollbackTransaction();
	}

	return isOk;
}

bool SqliteAPI::RemoveSong(const std::string& songId) {
	int id;
	if (TryParseInt(songId, id)) {		
		std::string sql = "DELETE FROM song WHERE id = @id";
		sqlite3_stmt *statement;
		int rtc = 0;
		bool result = false;

		rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
		if (rtc == SQLITE_OK) {
			rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), id);
			rtc = sqlite3_step(statement);
			if (rtc == SQLITE_DONE) {
				result = true;
			}
		}
		sqlite3_finalize(statement);
		return result;
	}
	return false;
}

bool SqliteAPI::CleanUpAfterRemoval() {
	// clean up potentionally empty genres, artists and albums
	sqlite3_stmt *statement;
	bool isOk = false;
	int rtc;

	auto sql = "DELETE FROM artist WHERE NOT EXISTS (SELECT * FROM song WHERE artistId = artist.id)";
	rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		if (rtc == SQLITE_DONE) {
			isOk = true;
		}
	}
	sqlite3_finalize(statement);

	if (isOk) {
		isOk = false;

		sql = "DELETE FROM genre WHERE NOT EXISTS (SELECT * FROM song WHERE genreId = genre.id)";
		rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
		if (rtc == SQLITE_OK) {
			rtc = sqlite3_step(statement);
			if (rtc == SQLITE_DONE) {
				isOk = true;
			}
		}
		sqlite3_finalize(statement);
	}

	if (isOk) {
		isOk = false;

		sql = "DELETE FROM album WHERE NOT EXISTS (SELECT * FROM song WHERE albumId = album.id)";
		rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
		if (rtc == SQLITE_OK) {
			rtc = sqlite3_step(statement);
			if (rtc == SQLITE_DONE) {
				isOk = true;
			}
		}
		sqlite3_finalize(statement);
	}

	return isOk;
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
			sql = "INSERT OR IGNORE INTO artist(name) VALUES(@artist)";
			rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@artist"), metadata.artist.c_str(), -1, NULL);
			rtc = sqlite3_step(statement);
			rtc = sqlite3_finalize(statement);
			// fetch artistId
			sql = "SELECT id FROM artist WHERE name = @artist";
			rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@artist"), metadata.artist.c_str(), -1, NULL);
			rtc = sqlite3_step(statement);
			if (rtc == SQLITE_ROW) {
				artistId = sqlite3_column_int(statement, 0);
			}
			rtc = sqlite3_finalize(statement);

			// we have an artist so we can try add album
			if (metadata.album.size() > 0) {
				// insert album into db
				sql = "INSERT OR IGNORE INTO album(artistId, name) VALUES (@artistId, @album)";
				rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
				rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@artistId"), artistId);
				rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@album"), metadata.album.c_str(), -1, NULL);
				rtc = sqlite3_step(statement);
				rtc = sqlite3_finalize(statement);
				// fetch albumId
				sql = "SELECT id FROM album WHERE name = @album AND artistId = @artistId";
				rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
				rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@artistId"), artistId);
				rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@album"), metadata.album.c_str(), -1, NULL);
				rtc = sqlite3_step(statement);
				if (rtc == SQLITE_ROW) {
					albumId = sqlite3_column_int(statement, 0);
				}
				rtc = sqlite3_finalize(statement);
			}
		}
		if (metadata.genre.size() > 0) {
			// insert genre into db
			sql = "INSERT OR IGNORE INTO genre(name) VALUES(@genre)";
			rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@genre"), metadata.genre.c_str(), -1, NULL);
			rtc = sqlite3_step(statement);
			rtc = sqlite3_finalize(statement);
			// fetch genreId
			sql = "SELECT id FROM genre WHERE name = @genre";
			rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@genre"), metadata.genre.c_str(), -1, NULL);
			rtc = sqlite3_step(statement);
			if (rtc == SQLITE_ROW) {
				genreId = sqlite3_column_int(statement, 0);
			}
			rtc = sqlite3_finalize(statement);
		}
		// now insert song
		sql = "INSERT OR IGNORE INTO song(title, artistId, albumId, genreId, length, path) VALUES(@title, @artistId, @albumId, @genreId, @length, @path)";
		rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);

		// bind parameters
		rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@title"), metadata.title.c_str(), -1, NULL);
		if(artistId > 0) rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@artistId"), artistId);
		if(albumId > 0) rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@albumId"), albumId);
		if (genreId > 0) rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@genreId"), genreId);
		rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@length"), metadata.duration);
		rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@path"), filename, -1, NULL);

		rtc = sqlite3_step(statement);
		rtc = sqlite3_finalize(statement);
	}
}

void SqliteAPI::SetSongNotFound(const bool notFound, const std::uint32_t songId) {
	sqlite3_stmt* statement;
	std::stringstream ss;

	ss << "UPDATE song SET notFound=" << (notFound ? 1 : 0) << " WHERE id = @id";
	std::string sql = ss.str();

	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), songId);
		sqlite3_step(statement);
	}
	sqlite3_finalize(statement);
}

bool SqliteAPI::RunFileAvailiabilityCheck() {
	bool isOk = true;
	sqlite3_stmt* statement;

	auto initialSql = "SELECT id, path, notFound FROM song";
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), initialSql, -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		std::vector<std::uint32_t> foundSongs;
		std::vector<std::uint32_t> notFoundSongs;
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			std::uint32_t id = sqlite3_column_int(statement, 0);
			auto path = TextFieldToString(sqlite3_column_text(statement, 1));
			bool notFound = sqlite3_column_int(statement, 2) == 1;

			bool exists = std::filesystem::exists(path);

			if (!exists && !notFound) {
				notFoundSongs.push_back(id);
			}
			else if (exists && notFound) {
				foundSongs.push_back(id);
			}

			rtc = sqlite3_step(statement);
		}
		sqlite3_finalize(statement);

		isOk = BeginTransaction() == ErrorCode::OK;
		if (isOk && foundSongs.size() > 0) {
			std::stringstream ss;
			ss << "UPDATE song SET notFound=0 WHERE id IN (";
			bool first = true;

			for (const auto& value : foundSongs) {
				if (first) {
					first = false;
				}
				else {
					ss << ',';
				}
				ss << value;
			}

			ss << ')';
			std::string sql = ss.str();
			isOk = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL) == SQLITE_OK;
			isOk = isOk && sqlite3_step(statement) == SQLITE_DONE;			
			sqlite3_finalize(statement);
		}

		if (isOk && notFoundSongs.size() > 0) {
			std::stringstream ss;
			ss << "UPDATE song SET notFound=1 WHERE id IN (";
			bool first = true;

			for (const auto& value : notFoundSongs) {
				if (first) {
					first = false;
				}
				else {
					ss << ',';
				}
				ss << value;
			}

			ss << ')';
			std::string sql = ss.str();
			isOk = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL) == SQLITE_OK;
			isOk = isOk && sqlite3_step(statement) == SQLITE_DONE;
			sqlite3_finalize(statement);
		}

		if (isOk) {
			isOk = CommitTransaction() == ErrorCode::OK;
		}
		else {
			RollbackTransaction();
		}
	}
	else {
		// TODO: log
		return false;
	}

	return isOk;
}

bool SqliteAPI::RefreshFileAvailability(const std::string& songId, bool& available) {
	bool isOk = false;
	sqlite3_stmt* statement;
	int id;
	if (!TryParseInt(songId, id)) {
		return false;
	}

	auto initialSql = "SELECT path, notFound FROM song WHERE id = @id";
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), initialSql, -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), id);
		rtc = sqlite3_step(statement);
		if (SQLITE_ROW == rtc) {
			auto path = TextFieldToString(sqlite3_column_text(statement, 0));
			available = sqlite3_column_int(statement, 1) == 0;

			bool exists = std::filesystem::exists(path);
			if ((!exists && available) || (exists && !available)) {
				// clean up after last command				
				sqlite3_finalize(statement);

				// prepare new command
				std::stringstream ss;
				ss << "UPDATE song SET notFound=" << (exists ? 0 : 1) << " WHERE id = @id";
				auto sql = ss.str();
				rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
				if (rtc == SQLITE_OK) {
					rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@id"), id);
					rtc = sqlite3_step(statement);
					if (SQLITE_DONE == rtc) {
						isOk = true;
						available = exists;
					}
				}
			}
			else {
				// no state changed, but the operation completed successfully
				isOk = true;
			}
		}
	}
	// clean up whatever statement was used last
	sqlite3_finalize(statement);
	
	return isOk;
}


bool SqliteAPI::GetNotFoundFiles(std::vector<SqliteAPI::NotFoundSongResult>& result) {
	sqlite3_stmt* statement;
	auto sql =	"SELECT s.id, s.title, art.name, alb.name, s.path"
				" FROM song AS s"
				" INNER JOIN artist AS art ON s.artistId = art.id"
				" INNER JOIN album AS alb ON s.albumId = alb.id"
				" WHERE s.notFound = 1";
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_step(statement);
		while (SQLITE_ROW == rtc) {
			NotFoundSongResult song;
			song.id = sqlite3_column_int(statement, 0);
			song.title = TextFieldToString(sqlite3_column_text(statement, 1));
			song.artistName = TextFieldToString(sqlite3_column_text(statement, 2));
			song.albumName = TextFieldToString(sqlite3_column_text(statement, 3));
			song.path = TextFieldToString(sqlite3_column_text(statement, 4));
			result.push_back(song);

			rtc = sqlite3_step(statement);
		}
		sqlite3_finalize(statement);
		return true;
	}
	else {
		// TODO: log
		return false;
	}
}

SqliteAPI::ErrorCode SqliteAPI::AddPlaylist(const std::string& userId, const std::string& name, const std::string& description, SqliteAPI::PlaylistResult& result) {
	if (userId.empty() || name.empty()) {
		return ErrorCode::ARGUMENT_ERROR;
	}
	sqlite3_stmt* statement;
	std::string sql = "INSERT INTO playlist(name, userId, description) VALUES(@name, @userId, @description)";

	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@name"), name.c_str(), -1, NULL);
		rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@userId"), userId.c_str(), -1, NULL);
		if (description.size() > 0) rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@description"), description.c_str(), -1, NULL);
		rtc = sqlite3_step(statement);
		sqlite3_finalize(statement);
		if (rtc == SQLITE_DONE) {
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
	params["id"] = std::to_string(changes.id);
	std::vector<PlaylistResult> v_playlist;
	auto errCode = Playlists(params, 1, 1, false, v_playlist);
	if (errCode == ErrorCode::OK && v_playlist.size() == 1) {

		if (nameChange || descriptionChange) {			
			std::stringstream ss;
			ss << "UPDATE playlist SET ";
			// fill values
			if (nameChange) {
				ss << "name = @name";
				if (descriptionChange) {
					ss << ',';
				}
			}
			if (descriptionChange) {
				ss << "description = @description";
			}
			ss << " WHERE id = " << changes.id;
			std::string sql = ss.str();

			sqlite3_stmt* statement;
			auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
			if (rtc == SQLITE_OK) {
				rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@name"), changes.name.c_str(), -1, NULL);
				rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@description"), changes.description.c_str(), -1, NULL);
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

	std::string sql = "DELETE FROM playlist WHERE id = @playlistId AND userId = @userId";

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql.c_str(), -1, &statement, NULL);
	if (rtc == SQLITE_OK) {
		rtc = sqlite3_bind_int(statement, sqlite3_bind_parameter_index(statement, "@playlistId"), playlistId);
		rtc = sqlite3_bind_text(statement, sqlite3_bind_parameter_index(statement, "@userId"), userId.c_str(), -1, NULL);
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
	params["id"] = std::to_string(playlistId);
	std::vector<PlaylistResult> playlist;
	auto errCode = Playlists(params, 1, 1, false, playlist);
	if (errCode == ErrorCode::OK && playlist.size() == 1) {
		// TODO: maybe enclose in a transaction if possible?
		errCode = BeginTransaction();
		if (errCode == ErrorCode::OK) {
			if (add.size() > 0) {
				errCode = AddSongsToPlaylist(playlistId, add);
			}
			if (errCode == ErrorCode::OK && remove.size() > 0) {
				errCode = RemoveSongsFromPlaylist(playlistId, remove);
			}
			if (errCode == ErrorCode::OK) {
				return CommitTransaction();
			}
			else {
				RollbackTransaction();
				return errCode;
			}
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
	ss << "DELETE FROM playlistSong WHERE playlistId =" << playlistId << " AND songId IN (";
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

SqliteAPI::ErrorCode SqliteAPI::BeginTransaction() {
	auto sql = "BEGIN TRANSACTION";

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
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

SqliteAPI::ErrorCode SqliteAPI::CommitTransaction() {
	auto sql = "COMMIT TRANSACTION";

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
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

SqliteAPI::ErrorCode SqliteAPI::RollbackTransaction() {
	auto sql = "ROLLBACK TRANSACTION";

	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(GetDbHandle(), sql, -1, &statement, NULL);
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

bool SqliteAPI::TryParseInt(const std::string& str, int& outInt) {
	if (str.size() > 0) {
		int rtc = 0;
		for (const char& c : str)
		{
			if (c >= '0' && c <= '9') {
				rtc *= 10;
				rtc += c - '0';
			}
			else {
				return false;
			}
		}
		outInt = rtc;
		return true;
	}
	return false;
}