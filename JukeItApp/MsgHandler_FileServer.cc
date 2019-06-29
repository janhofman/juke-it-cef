#include "MsgHandler_FileServer.h"

MsgHandler_FileServer::MsgHandler_FileServer(const CefString& startup_url)
	: startup_url_(startup_url) {
	sqliteAPI_.reset(new SqliteAPI());
}

MsgHandler_FileServer::~MsgHandler_FileServer() {
	// close server
	if (fileserver_.get() != nullptr) {
		fileserver_->close().wait();
	}
	fileserver_.reset();
	fileserver_handler_.reset();
	sqliteAPI_.reset();
}

MsgHandler_FileServer::CommandName MsgHandler_FileServer::GetCommandName(const web::json::value& request)
{
	if (request.is_object()) {
		auto it = request.as_object().find(U("command"));

		if (it != request.as_object().end() && it->second.is_string()) {
			std::string command = ToUpperCase(utility::conversions::to_utf8string(it->second.as_string()));

			if (StartsWith(command, "FLS")) {
				if (StartsWith(command, "FLS_OPEN_SERVER")) {
					return CommandName::OPEN_SERVER;
				}
				else if (StartsWith(command, "FLS_CLOSE_SERVER")) {
					return CommandName::CLOSE_SERVER;
				}
				else if (StartsWith(command, "FLS_ADD_FILES")) {
					return CommandName::ADD_FILES;
				}
				else {
					return CommandName::NOT_SUPPORTED;
				}
			}
			else {
				return CommandName::NOT_SUPPORTED;
			}
		}
	}
	return CommandName::NOT_SUPPORTED;
}

// Called due to cefQuery execution in message_router.html.
bool MsgHandler_FileServer::OnQuery(CefRefPtr<CefBrowser> browser,
	CefRefPtr<CefFrame> frame,
	int64 query_id,
	const CefString& request,
	bool persistent,
	CefRefPtr<Callback> callback) {
	// Only handle messages from the startup URL.
	/*const std::string& url = frame->GetURL();
	if (url.find(startup_url_) != 0)
		return false;*/

	const std::string& requestString = request;
	web::json::value requestJSON;
	if (!TryParseJSON(requestString, requestJSON) && !requestJSON.is_object()) {
		return false;
	}
	CommandName command = GetCommandName(requestJSON);

	if (command == CommandName::NOT_SUPPORTED) {
		return false;
	}

	switch (command) {
	case CommandName::OPEN_SERVER: {
		OpenServer(requestJSON, callback);
		return true;
	}
	case CommandName::CLOSE_SERVER: {
		CloseServer(callback);
		return true;
	}
	case CommandName::ADD_FILES: {
		AddFiles(callback);
		return true;
	}

	}
	return false;
}

void MsgHandler_FileServer::OpenServer(web::json::value request, CefRefPtr<Callback> callback) {
	// get payload
	if (request.is_object()) {
		std::string hostName = "*";
		std::uint16_t port = 26331; // default
		auto payloadIt = request.as_object().find(U("payload"));
		if (payloadIt != request.as_object().end() && payloadIt->second.is_object()) {
			auto payload = payloadIt->second.as_object();

			auto hostNameIt = payload.find(U("hostName"));
			if (hostNameIt != payload.end() && hostNameIt->second.is_string()) {
				hostName = utility::conversions::to_utf8string(hostNameIt->second.as_string());
			}

			auto portIt = payload.find(U("port"));
			if (portIt != payload.end() && portIt->second.is_number()) {
				auto num = portIt->second.as_integer();
				if (num > 0 && num < 65536) {
					port = (std::uint16_t)num;
				}
				else {
					callback->Failure(12, "port is outside of port value range 1 - 65535");
					return;
				}
			}
		}
		std::stringstream ss;
		ss << "http://" << hostName << ":" << port << "/api";
		std::string address = ss.str();

		pplx::create_task([=]() {
			std::lock_guard<std::mutex> guard(mutex);
			if (!running_) {
				fileserver_handler_.reset(new FileServerHandler(sqliteAPI_.get()));
				fileserver_.reset(new FileServerAPI(address, fileserver_handler_.get()));
				fileserver_->open().then([=](pplx::task<void> t) {
					try
					{
						t.get();
						running_ = true;

						web::json::value response;
						response[U("status")] = web::json::value::number(0);
						response[U("address")] = web::json::value::string(fileserver_->GetAddress());

						callback->Success(utility::conversions::to_utf8string(response.to_string()));
					}
					catch (...)
					{						
						// reset pointers
						fileserver_.reset();
						fileserver_handler_.reset();

						callback->Failure(ReturnCode::FAILED_TO_OPEN, "Server failed to open.");
					}
				}).wait(); // !!! IMPORTANT TO HOLD MUTEX DURING OPENING
			}
			else {
				callback->Failure(ReturnCode::ALREADY_RUNNING, "Server is already running.");
			}
		});
	}
	else {
		callback->Failure(ReturnCode::BAD_REQUEST, "Bad request.");
	}
}

void MsgHandler_FileServer::CloseServer(CefRefPtr<Callback> callback) {
	pplx::create_task([=]() {
		std::lock_guard<std::mutex> guard(mutex);
		if (running_) {
			fileserver_->close().then([=](pplx::task<void> t) {
				try
				{
					t.get();
					running_ = false;

					fileserver_.reset();
					fileserver_handler_.reset();

					web::json::value response;
					response[U("status")] = web::json::value::number(0);

					callback->Success(utility::conversions::to_utf8string(response.to_string()));
				}
				catch (...)
				{
					callback->Failure(1, "Server failed to close.");
				}
			}).wait(); // !!! IMPORTANT TO HOLD MUTEX DURING CLOSING
		}
		else {
			web::json::value response;
			response[U("status")] = web::json::value::number(0);

			callback->Success(utility::conversions::to_utf8string(response.to_string()));
		}
	});
}

void MsgHandler_FileServer::AddFiles(CefRefPtr<Callback> callback) {
	pplx::create_task([=]() {
		sqliteAPI_->AddFiles(); 
	}).then([=](pplx::task<void> t) {
		try {
			t.get();

			web::json::value response;
			response[U("status")] = web::json::value::number(0);

			callback->Success(utility::conversions::to_utf8string(response.to_string()));
		}
		catch (...) {
			callback->Failure(123, "Adding files failed");
		}
	});
}

