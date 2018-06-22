#include "rest.h"

FileServerAPI::FileServerAPI(utility::string_t& url, AbstractFileServerHandler *handler) : m_listener(url), fsHandler_(handler)
{
	m_listener.support(web::http::methods::GET, std::bind(&FileServerAPI::handle_get, this, std::placeholders::_1));
	/*m_listener.support(web::http::methods::PUT, std::bind(&FileServerAPI::handle_put, this, std::placeholders::_1));
	m_listener.support(web::http::methods::POST, std::bind(&FileServerAPI::handle_post, this, std::placeholders::_1));
	m_listener.support(web::http::methods::DEL, std::bind(&FileServerAPI::handle_delete, this, std::placeholders::_1));*/
}

void FileServerAPI::handle_get(web::http::http_request message)
{
#if _DEBUG
	ucout << message.to_string() << std::endl;
#endif
	auto paths = web::http::uri::split_path(web::http::uri::decode(message.relative_uri().path()));
	auto query = message.relative_uri().query();
	auto queries = web::http::uri::split_query(query);
	if (paths.empty())
	{
		message.reply(web::http::status_codes::NotFound);
		return;
	}
	auto pathLength = paths.size();

	if (paths[0] == U("v1")) {
		if (pathLength > 1) {
			if (paths[1] == U("songs")) {
				std::size_t start = 0;
				auto startIt = queries.find(U("start"));
				if (startIt != queries.end()) {
					if (!TryParseSizeT(startIt->second, &start)) {
						message.reply(web::http::status_codes::NotFound);
						return;
					}
				}
				std::size_t limit = 100;
				auto limitIt = queries.find(U("limit"));
				if (limitIt != queries.end()) {
					if (!TryParseSizeT(limitIt->second, &limit)) {
						message.reply(web::http::status_codes::NotFound);
						return;
					}
					else {
						if (limit > 1000) {
							limit = 1000;
						}
					}
				}

				web::json::value result;
				auto rtc = fsHandler_->Songs(start, limit, &result);
				if (rtc) {
					message.reply(web::http::status_codes::OK, result);
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

	// Get information on a specific table.
	auto found = queries.find(U("aaa"));
	if (found == queries.end())
	{
		message.reply(web::http::status_codes::NotFound);
	}

	else
	{
		message.reply(web::http::status_codes::OK, found->second);
	}
};

bool FileServerAPI::TryParseSizeT(utility::string_t& s, std::size_t* outValue) {
	if (s.size() > 0) {
		std::size_t val = 0;
		for (auto it = s.begin(); it != s.end(); it++) {
			if (isdigit(*it)) {
				val *= 10;
				val += *it - '0';
			}
			else {
				return false;
			}
		}
		*outValue = val;
		return true;
	}
	return false;
}

