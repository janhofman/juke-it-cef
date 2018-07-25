#ifndef JUKEIT_ABSTRACT_MESSAGE_HANDLER_H_
#define JUKEIT_ABSTRACT_MESSAGE_HANDLER_H_

#include <unordered_map>
#include <fstream>
#include <cctype>

#include "include/wrapper/cef_helpers.h"
#include "include/wrapper/cef_message_router.h"
#include "cpprestsdk/include/cpprest/json.h"
#include "cpprestsdk/include/cpprest/details/basic_types.h"

class AbstractMessageHandler : public CefMessageRouterBrowserSide::Handler {
public:
	bool OnQuery(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id,
		const CefString& request,
		bool persistent,
		CefRefPtr<Callback> callback) OVERRIDE = 0;

protected:
	static bool StartsWith(const std::string& s, const std::string& prefix);
	static void AppendJSONString(std::stringstream& stream, const char * key, const unsigned char* value);
	static void AppendJSONInt(std::stringstream& stream, const char *key, const unsigned char* value);
	static void AppendJSONInt(std::stringstream& stream, const char *key, int value);
	static bool TryParseJSON(const std::string& json, web::json::value& parsedJSON);
	std::unordered_map<std::string, std::string> GetParams(const std::string& command);
	bool FileExists(const char *filename);
	inline static std::string ToUpperCase(std::string s) {
		std::transform(s.begin(), s.end(), s.begin(),
			[](unsigned char c) { return std::toupper(c); }
		);
		return s;
	}

	static const char QUOTES;
};
#endif
