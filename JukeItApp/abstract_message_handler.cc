#include "abstract_message_handler.h"

const char  AbstractMessageHandler::QUOTES = '"';

bool AbstractMessageHandler::StartsWith(const std::string& s, const std::string& prefix) {
	return s.size() >= prefix.size() && s.compare(0, prefix.size(), prefix) == 0;
}

void AbstractMessageHandler::AppendJSONString(std::stringstream& stream, const char * key, const unsigned char* str) {
	stream << QUOTES << key << QUOTES << ':';
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

void AbstractMessageHandler::AppendJSONInt(std::stringstream& stream, const char * key, const unsigned char* str) {
	stream << QUOTES << key << QUOTES << ':';
	if (str) {		
		stream << str;
	}
	else {
		stream << "null";
	}
}

void AbstractMessageHandler::AppendJSONInt(std::stringstream& stream, const char * key, int value) {
	stream << QUOTES << key << QUOTES << ':';
	stream << value;
}

std::unordered_map<std::string, std::string> AbstractMessageHandler::GetParams(const std::string& command) {
	std::unordered_map<std::string, std::string> map;
	size_t start = command.find('?');
	if (start != std::string::npos) {
		std::stringstream ss;
		bool key = true;
		std::string keyVal;
		bool backslash = false;
		for (size_t i = start + 1; i < command.length(); i++)
		{
			char chr = command[i];
			// chack if char is escaped
			if (chr == '\\' && !backslash) {
				backslash = true;
				continue;
			}
			// first handle escaped char
			if (backslash) {
				backslash = false;
				ss << chr; // anything escaped is itself (but only '&', '\' and '=' need to be escaped)
				continue;
			}
			switch (chr)
			{
			case '=':
				if (key) {
					keyVal = ss.str();
					ss.clear();
					ss.str(std::string());
					key = false;
				}
				else {
					// can report malformed instruction but we don't have logging yet
				}
				break;
			case '&':
				if (!key) {
					map.insert(std::make_pair(keyVal, ss.str()));
					ss.clear();
					ss.str(std::string());
					key = true;
				}
				else {
					// can report malformed instruction but we don't have logging yet
				}
				break;
			default:
				ss << chr;
				break;
			}
		}
		// flush last pair
		if (key == false) {
			map.insert(std::make_pair(keyVal, ss.str()));
		}
	}
	return map;
}

bool AbstractMessageHandler::FileExists(const char *filename)
{
	std::ifstream ifile(filename);
	return ifile.good();
}
