#include "sqlite_handler.h"
#include <sstream>

const char * SqliteHandler::DATABASE_NAME_ = "data.dat";
const char  SqliteHandler::QUOTES = '"';

SqliteHandler::SqliteHandler(const CefString& startup_url)
	: startup_url_(startup_url) {
	auto rtc = sqlite3_open(DATABASE_NAME_, &db_handle_);
	if (rtc != SQLITE_OK) {
		//TODO: an issue occured
	}
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
		//std::string result = "[{\"id\":1,\"name\":\"Heavy Metal\"}]";
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

	}
	/*
	if (message_name.find("ciaoC++") == 0) {
		// Reverse the string and return.
		std::string result = std::string("Ciao, JavaScript! ");
		auto rtc = sqlite3_open("data.dat", &db_handle_);
		sqlite3_stmt* statement;
		rtc = sqlite3_prepare_v2(db_handle_, "select id, title from songs;", -1, &statement, NULL);
		rtc = sqlite3_step(statement);
		if (SQLITE_ROW == rtc) {
			result += std::string((char*)sqlite3_column_text(statement, 0));
			result += std::string((char*)sqlite3_column_text(statement, 1));
		}
		rtc = rtc + 3;
		callback->Success(result);
		return true;
	}
	*/
	return false;
}

std::string SqliteHandler::LoadGenres() {
	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(db_handle_, "SELECT id, name FROM genre", -1, &statement, NULL);
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
		ss << '{' << QUOTES << "id" <<QUOTES << ':';
		// append id
		ss << sqlite3_column_text(statement, 0);
		//append name
		ss << ',' << QUOTES << "name" << QUOTES << ':' << QUOTES;
		ss << sqlite3_column_text(statement, 1);
		// finish object
		ss << QUOTES << '}';
		rtc = sqlite3_step(statement);
		first = false;
	}
	// end array
	ss << ']';
	sqlite3_finalize(statement);

	MusicPlayer player;
	player.Play2("H:\\Music\\Linkin Park\\Linkin Park-Hybrid Theory(Darkside_RG)\\08_-In_The_End.mp3");
	//DecodeFile("H:\\Music\\Linkin Park\\Linkin Park-Hybrid Theory(Darkside_RG)\\08_-In_The_End.mp3", "output.pcm");


	return ss.str();
}

std::string SqliteHandler::LoadArtists() {
	sqlite3_stmt* statement;
	auto rtc = sqlite3_prepare_v2(db_handle_, "SELECT id, name FROM artist", -1, &statement, NULL);
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
		ss << '{' << QUOTES << "id" << QUOTES << ':';
		// append id
		ss << sqlite3_column_text(statement, 0);
		//append name
		ss << ',' << QUOTES << "name" << QUOTES << ':' << QUOTES;
		ss << sqlite3_column_text(statement, 1);
		// finish object
		ss << QUOTES << '}';
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
	auto rtc = sqlite3_prepare_v2(db_handle_, sql, -1, &statement, NULL);
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
		ss << '{' << QUOTES << "id" << QUOTES << ':';
		// append id
		ss << sqlite3_column_text(statement, 0);
		//append name
		ss << ',' << QUOTES << "name" << QUOTES << ':';
		ss << QUOTES << sqlite3_column_text(statement, 1) << QUOTES;
		// append artistName
		ss << ',' << QUOTES << "artistName" << QUOTES << ':';
		ss << QUOTES << sqlite3_column_text(statement, 2) << QUOTES;
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
	auto rtc = sqlite3_prepare_v2(db_handle_, sql, -1, &statement, NULL);
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
		ss << QUOTES << "id" << QUOTES << ':';		
		AppendInt(ss, sqlite3_column_text(statement, 0));
		//append title
		ss << ',' << QUOTES << "title" << QUOTES << ':';
		AppendString(ss, sqlite3_column_text(statement, 1));
		// append length
		ss << ',' << QUOTES << "length" << QUOTES << ':';
		AppendInt(ss, sqlite3_column_text(statement, 2));
		// append path
		ss << ',' << QUOTES << "path" << QUOTES << ':';
		AppendString(ss, sqlite3_column_text(statement, 3));
		// append artist
		ss << ',' << QUOTES << "artist" << QUOTES << ':';
		AppendString(ss, sqlite3_column_text(statement, 4));
		// append album
		ss << ',' << QUOTES << "album" << QUOTES << ':';
		AppendString(ss, sqlite3_column_text(statement, 5));
		// append genre
		ss << ',' << QUOTES << "genre" << QUOTES << ':';
		AppendString(ss, sqlite3_column_text(statement, 6));
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

bool SqliteHandler::StartsWith(const std::string& s, const std::string& prefix) {
	return s.size() >= prefix.size() && s.compare(0, prefix.size(), prefix) == 0;
}

void SqliteHandler::AppendString(std::stringstream& stream, const unsigned char* str) {
	if (str) {
		stream << QUOTES;
		// sanitize string
		const unsigned char * character = str;
		while (*character != '\0') {
			if (*character == '\\') {
				// double the backslashes
				stream << *character;
			}
			stream << *character;
			++character;
		}
		stream << QUOTES;
	}
	else {
		stream << QUOTES << QUOTES;
	}
}

void SqliteHandler::AppendInt(std::stringstream& stream, const unsigned char* str) {
	if (str) {
		stream << str;
	}
	else {
		stream << "null";
	}
}