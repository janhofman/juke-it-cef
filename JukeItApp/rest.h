#ifndef REST_API_H_
#define REST_API_H_

#include "cpprestsdk/Release/include/cpprest/json.h"
#include "cpprestsdk/Release/include/cpprest/http_listener.h"
#include "cpprestsdk/Release/include/cpprest/uri.h"
#include "cpprestsdk/Release/include/cpprest/asyncrt_utils.h"

#include "AbstractFileServerHandler.h"

class FileServerAPI
{
public:
	FileServerAPI() { }
	FileServerAPI(utility::string_t& url, AbstractFileServerHandler *handler);


	pplx::task<void> open() { return m_listener.open(); }
	pplx::task<void> close() { return m_listener.close(); }

private:

	void handle_get(web::http::http_request message);
	/*void handle_put(web::http::http_request message);
	void handle_post(web::http::http_request message);
	void handle_delete(web::http::http_request message);*/

	AbstractFileServerHandler *fsHandler_ = NULL;
	web::http::experimental::listener::http_listener m_listener;
	bool TryParseSizeT(utility::string_t& s, std::size_t* outValue);
};

#endif
