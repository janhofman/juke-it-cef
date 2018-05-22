#ifndef JUKEIT_ABSTRACT_MESSAGE_HANDLER_H_
#define JUKEIT_ABSTRACT_MESSAGE_HANDLER_H_

#include <unordered_map>
#include <fstream>

#include "include/wrapper/cef_helpers.h"
#include "include/wrapper/cef_message_router.h"

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
	std::unordered_map<std::string, std::string> GetParams(const std::string& command);
	bool FileExists(const char *filename);

	static const char QUOTES;
};
#endif
