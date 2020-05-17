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
				else if (StartsWith(command, "FLS_REMOVE_FILES")) {
					return CommandName::REMOVE_FILES;
				}
				else if (StartsWith(command, "FLS_REMOVE_ONE_FILE")) {
					return CommandName::REMOVE_ONE_FILE;
				}
				else if (StartsWith(command, "FLS_GET_NOT_FOUND_FILES")) {
					return CommandName::GET_NOT_FOUND_FILES;
				}
				else if (StartsWith(command, "FLS_FILE_AVAILABILITY_CHECK")) {
					return CommandName::FILE_AVAILABILITY_CHECK;
				}
				else if (StartsWith(command, "FLS_REFRESH_FILE_AVAILABILITY")) {
					return CommandName::REFRESH_FILE_AVAILABILITY;
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
	case CommandName::REMOVE_FILES: {
		RemoveFiles(requestJSON, callback);
		return true;
	}
	case CommandName::REMOVE_ONE_FILE: {
		RemoveFile(requestJSON, callback);
		return true;
	}
	case CommandName::GET_NOT_FOUND_FILES: {
		GetNotFoundFiles(callback);
		return true;
	}
	case CommandName::FILE_AVAILABILITY_CHECK: {
		RunFileAvailabilityCheck(callback);
		return true;
	}
	case CommandName::REFRESH_FILE_AVAILABILITY: {
		RefreshFileAvailability(requestJSON, callback);
		return true;
	}
	default:
		return false;
	}
	return false;
}

void MsgHandler_FileServer::OpenServer(const web::json::value& request, CefRefPtr<Callback> callback) {
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

						callback->Success(utility::conversions::to_utf8string(response.serialize()));
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

					callback->Success(utility::conversions::to_utf8string(response.serialize()));
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

			callback->Success(utility::conversions::to_utf8string(response.serialize()));
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

			callback->Success(utility::conversions::to_utf8string(response.serialize()));
		}
		catch (...) {
			callback->Failure(123, "Adding files failed");
		}
	});
}

void MsgHandler_FileServer::RemoveFiles(const web::json::value& request, CefRefPtr<Callback> callback) {
	if (request.is_object()) {
		std::vector<std::string> remove;
		auto payloadIt = request.as_object().find(U("payload"));
		if (payloadIt != request.as_object().end() && payloadIt->second.is_object()) {
			auto payload = payloadIt->second.as_object();

			auto valIt = payload.find(U("remove"));
			if (valIt != payload.end()) {
				if (valIt->second.is_array()) {
					auto removeArray = valIt->second.as_array();
					for (auto it = removeArray.begin(); it < removeArray.end(); it++)
					{
						if (it->is_string()) {
							remove.push_back(utility::conversions::to_utf8string(it->as_string()));
						}
					}
				}
			}
		}

		try {
			sqliteAPI_->RemoveFiles(remove);

			web::json::value response;
			response[U("status")] = web::json::value::number(0);

			callback->Success(utility::conversions::to_utf8string(response.serialize()));
		}
		catch (...) {
			callback->Failure(124, "Removing files failed");
		}
	}
	else {
		callback->Failure(ReturnCode::BAD_REQUEST, "Bad request.");
	}
}

void MsgHandler_FileServer::RemoveFile(const web::json::value& request, CefRefPtr<Callback> callback) {
	if (request.is_object()) {
		auto payloadIt = request.as_object().find(U("payload"));
		if (payloadIt != request.as_object().end() && payloadIt->second.is_object()) {
			auto payload = payloadIt->second.as_object();

			auto valIt = payload.find(U("songId"));
			if (valIt != payload.end()) {
				if (valIt->second.is_string()) {
					auto songId = utility::conversions::to_utf8string(valIt->second.as_string());

					try {
						bool success = sqliteAPI_->RemoveFile(songId);

						web::json::value response;
						response[U("success")] = web::json::value::boolean(success);

						callback->Success(utility::conversions::to_utf8string(response.serialize()));
					}
					catch (...) {
						callback->Failure(-1, "Removing file failed");
					}
				}
			}
		}
	}	
	callback->Failure(ReturnCode::BAD_REQUEST, "Bad request.");
}

void MsgHandler_FileServer::GetNotFoundFiles(CefRefPtr<Callback> callback) {
	pplx::create_task([=]() {
		std::vector<SqliteAPI::NotFoundSongResult> result;
		auto success = sqliteAPI_->GetNotFoundFiles(result);
		if (success) {
			return result;
		}
		else {
			throw new std::exception("SqliteAPI::GetNotFoundFiles returned false");
		}
	}).then([=](pplx::task<std::vector<SqliteAPI::NotFoundSongResult>> t) {
		try {
			auto result = t.get();

			auto response = web::json::value::array(result.size());
			for (size_t i = 0; i < result.size(); i++)
			{
				auto& itm = result[i];
				web::json::value song;
				song[U("id")] = IdValue(itm.id);
				song[U("title")] = StringValue(itm.title);
				song[U("artistName")] = StringValue(itm.artistName);
				song[U("albumName")] = StringValue(itm.albumName);
				song[U("path")] = StringValue(itm.path);

				response.as_array()[i] = song;
			}			

			callback->Success(utility::conversions::to_utf8string(response.serialize()));
		}
		catch (const std::exception& e) {
			callback->Failure(-1, e.what());
		}
		catch (...) {
			callback->Failure(-1, "MsgHandler_FileServer::GetNotFoundFiles: Unknown exception occured");
		}
	});
}

void MsgHandler_FileServer::RunFileAvailabilityCheck(CefRefPtr<Callback> callback) {
	pplx::create_task([=]() {
		auto success = sqliteAPI_->RunFileAvailiabilityCheck();
		return success;
	}).then([=](pplx::task<bool> t) {
		try {
			auto result = t.get();

			web::json::value response;
			response[U("success")] = web::json::value::boolean(result);

			callback->Success(utility::conversions::to_utf8string(response.serialize()));
		}
		catch (const std::exception& e) {
			callback->Failure(-1, e.what());
		}
		catch (...) {
			callback->Failure(-1, "MsgHandler_FileServer::RunFileAvailabilityCheck: Unknown exception occured");
		}
	});
}

void MsgHandler_FileServer::RefreshFileAvailability(const web::json::value& request, CefRefPtr<Callback> callback) {
	if (request.is_object()) {
		auto payloadIt = request.as_object().find(U("payload"));
		if (payloadIt != request.as_object().end() && payloadIt->second.is_object()) {
			auto payload = payloadIt->second.as_object();

			auto valIt = payload.find(U("songId"));
			if (valIt != payload.end()) {
				if (valIt->second.is_string()) {
					auto songId = utility::conversions::to_utf8string(valIt->second.as_string());

					try {
						bool available = false;
						bool success = sqliteAPI_->RefreshFileAvailability(songId, available);

						web::json::value response;
						response[U("success")] = web::json::value::boolean(success);
						response[U("available")] = web::json::value::boolean(available);

						callback->Success(utility::conversions::to_utf8string(response.serialize()));
					}
					catch (...) {
						callback->Failure(-1, "Refreshing file availability failed");
					}
				}
			}
		}
	}
	callback->Failure(ReturnCode::BAD_REQUEST, "Bad request.");
}

web::json::value MsgHandler_FileServer::StringValue(std::string& str) {
	if (str.empty()) {
		return web::json::value::null();
	}
	return web::json::value::string(utility::conversions::to_string_t(str));
}

web::json::value MsgHandler_FileServer::IdValue(std::uint32_t id) {
	if (id == 0) {
		return web::json::value::null();
	}
	return web::json::value::string(utility::conversions::to_string_t(std::to_string(id)));
}