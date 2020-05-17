#include "MsgHandler_Configuration.h"

MsgHandler_Configuration::MsgHandler_Configuration(const CefString& startup_url)
	: startup_url_(startup_url) {
}

// Called due to cefQuery execution in message_router.html.
bool MsgHandler_Configuration::OnQuery(CefRefPtr<CefBrowser> browser,
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
	case CommandName::GET_CONFIG: {
		GetConfig(callback);
		return true;
	}
	case CommandName::SAVE_CONFIG: {
		SaveConfig(requestJSON, callback);
		return true;
	}
	default:
		return false;
	}
	return false;
}

MsgHandler_Configuration::CommandName MsgHandler_Configuration::GetCommandName(const web::json::value& request)
{
	if (request.is_object()) {
		auto it = request.as_object().find(utility::conversions::to_string_t("command"));

		if (it != request.as_object().end() && it->second.is_string()) {
			std::string command = ToUpperCase(utility::conversions::to_utf8string(it->second.as_string()));

			if (StartsWith(command, "CFG")) {
				if (StartsWith(command, "CFG_GET_CONFIG")) {
					return CommandName::GET_CONFIG;
				}
				else if (StartsWith(command, "CFG_SAVE_CONFIG")) {
					return CommandName::SAVE_CONFIG;
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

void MsgHandler_Configuration::SaveConfig(web::json::value request, CefRefPtr<Callback> callback) {
	if (request.is_object()) {
		auto payloadIt = request.as_object().find(utility::conversions::to_string_t("payload"));
		if (payloadIt != request.as_object().end() && payloadIt->second.is_object()) {
			auto payload = payloadIt->second.as_object();

			// first verify the settings are loaded and the settings are therefore initialized
			if (!settingsLoaded_) {
				LoadConfig();
				settingsLoaded_ = true;
			}

			// overwrite settings with new values
			settings_.FromJSON(payload);

			boost::property_tree::ptree tree;
			/*** PLAYER SETTINGS ***/
			tree.put(PATH_PLAYER_REMOTE_CONNECTONSTARTUP, settings_.player_.remote.connectOnStartup);
			tree.put(PATH_PLAYER_LOCAL_HOSTNAME, settings_.player_.local.hostname);
			tree.put(PATH_PLAYER_LOCAL_LOCALHOST, settings_.player_.local.localhost);
			tree.put(PATH_PLAYER_LOCAL_PORT, settings_.player_.local.port);
			tree.put(PATH_PLAYER_LOCAL_RUNONSTARTUP, settings_.player_.local.runOnStartup);
			tree.put(PATH_PLAYER_REMOTE_HOSTNAME, settings_.player_.remote.hostname);
			tree.put(PATH_PLAYER_REMOTE_PORT, settings_.player_.remote.port);

			/*** FILESERVER SETTINGS ***/
			tree.put(PATH_FS_REMOTE_CONNECTONSTARTUP, settings_.fileServer.remote.connectOnStartup);
			tree.put(PATH_FS_LOCAL_HOSTNAME, settings_.fileServer.local.hostname);
			tree.put(PATH_FS_LOCAL_LOCALHOST, settings_.fileServer.local.localhost);
			tree.put(PATH_FS_LOCAL_PORT, settings_.fileServer.local.port);
			tree.put(PATH_FS_LOCAL_RUNONSTARTUP, settings_.fileServer.local.runOnStartup);
			tree.put(PATH_FS_REMOTE_HOSTNAME, settings_.fileServer.remote.hostname);
			tree.put(PATH_FS_REMOTE_PORT, settings_.fileServer.remote.port);

			try {
				boost::property_tree::write_json("config.json", tree);
			}
			catch (...) {
				callback->Failure(22, "Error occured during saving of configuration");
				return;
			}			

			web::json::value response;
			response[utility::conversions::to_string_t("result")] = web::json::value::number(0);
			callback->Success(utility::conversions::to_utf8string(response.serialize()));
		}
	}
	callback->Failure(12, "Malformed request");
	return;
}

void MsgHandler_Configuration::GetConfig(CefRefPtr<Callback> callback) {
	// first verify the settings are loaded
	if (!settingsLoaded_) {
		LoadConfig();
		settingsLoaded_ = true;
	}

	callback->Success(utility::conversions::to_utf8string(settings_.ToJSON().serialize()));
}

web::json::value MsgHandler_Configuration::Settings::ToJSON() {
	web::json::value settings;

	settings[utility::conversions::to_string_t(PROPERTY_SETTINGS_PLAYER)] = player_.ToJSON();
	settings[utility::conversions::to_string_t(PROPERTY_SETTINGS_FILESERVER)] = fileServer.ToJSON();

	return settings;
}

web::json::value MsgHandler_Configuration::LocalPlayerSettings::ToJSON() {
	web::json::value settings;
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL_HOSTNAME)] = web::json::value::string(utility::conversions::to_string_t(hostname));
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL_PORT)] = web::json::value::number(port);
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL_LOCALHOST)] = web::json::value::boolean(localhost);
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL_RUNONSTARTUP)] = web::json::value::boolean(runOnStartup);

	return settings;
}

web::json::value MsgHandler_Configuration::RemotePlayerSettings::ToJSON() {
	web::json::value settings;
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_REMOTE_HOSTNAME)] = web::json::value::string(utility::conversions::to_string_t(hostname));
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_REMOTE_PORT)] = web::json::value::number(port);
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_REMOTE_CONNECTONSTARTUP)] = web::json::value::boolean(connectOnStartup);

	return settings;
}

web::json::value MsgHandler_Configuration::PlayerSettings::ToJSON() {
	web::json::value settings;
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL)] = local.ToJSON();
	settings[utility::conversions::to_string_t(PROPERTY_PLAYER_REMOTE)] = remote.ToJSON();

	return settings;
}

web::json::value MsgHandler_Configuration::LocalFileServerSettings::ToJSON() {
	web::json::value settings;
	settings[utility::conversions::to_string_t(PROPERTY_FS_LOCAL_HOSTNAME)] = web::json::value::string(utility::conversions::to_string_t(hostname));
	settings[utility::conversions::to_string_t(PROPERTY_FS_LOCAL_PORT)] = web::json::value::number(port);
	settings[utility::conversions::to_string_t(PROPERTY_FS_LOCAL_LOCALHOST)] = web::json::value::boolean(localhost);
	settings[utility::conversions::to_string_t(PROPERTY_FS_LOCAL_RUNONSTARTUP)] = web::json::value::boolean(runOnStartup);

	return settings;
}

web::json::value MsgHandler_Configuration::RemoteFileServerSettings::ToJSON() {
	web::json::value settings;
	settings[utility::conversions::to_string_t(PROPERTY_FS_REMOTE_HOSTNAME)] = web::json::value::string(utility::conversions::to_string_t(hostname));
	settings[utility::conversions::to_string_t(PROPERTY_FS_REMOTE_PORT)] = web::json::value::number(port);
	settings[utility::conversions::to_string_t(PROPERTY_FS_REMOTE_CONNECTONSTARTUP)] = web::json::value::boolean(connectOnStartup);

	return settings;
}

web::json::value MsgHandler_Configuration::FileServerSettings::ToJSON() {
	web::json::value settings;
	settings[utility::conversions::to_string_t(PROPERTY_FS_LOCAL)] = local.ToJSON();
	settings[utility::conversions::to_string_t(PROPERTY_FS_REMOTE)] = remote.ToJSON();

	return settings;
}

void MsgHandler_Configuration::LocalPlayerSettings::FromJSON(web::json::object json) {
	auto hostnameIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL_HOSTNAME));
	if (hostnameIt != json.end() && hostnameIt->second.is_string()) {
		hostname = utility::conversions::to_utf8string(hostnameIt->second.as_string());
	}

	auto portIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL_PORT));
	if (portIt != json.end() && portIt->second.is_number()) {
		port = portIt->second.as_number().to_uint32();
	}

	auto localhostIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL_LOCALHOST));
	if (localhostIt != json.end() && localhostIt->second.is_boolean()) {
		localhost = localhostIt->second.as_bool();
	}

	auto runIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL_RUNONSTARTUP));
	if (runIt != json.end() && runIt->second.is_boolean()) {
		runOnStartup = runIt->second.as_bool();
	}
}

void MsgHandler_Configuration::RemotePlayerSettings::FromJSON(web::json::object json) {
	auto hostnameIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_REMOTE_HOSTNAME));
	if (hostnameIt != json.end() && hostnameIt->second.is_string()) {
		hostname = utility::conversions::to_utf8string(hostnameIt->second.as_string());
	}

	auto portIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_REMOTE_PORT));
	if (portIt != json.end() && portIt->second.is_number()) {
		port = portIt->second.as_number().to_uint32();
	}
	
	auto connectIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_REMOTE_CONNECTONSTARTUP));
	if (connectIt != json.end() && connectIt->second.is_boolean()) {
		connectOnStartup = connectIt->second.as_bool();
	}
}

void MsgHandler_Configuration::PlayerSettings::FromJSON(web::json::object json) {
	auto localIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_LOCAL));
	if (localIt != json.end() && localIt->second.is_object()) {
		local.FromJSON(localIt->second.as_object());
	}

	auto remoteIt = json.find(utility::conversions::to_string_t(PROPERTY_PLAYER_REMOTE));
	if (remoteIt != json.end() && remoteIt->second.is_object()) {
		remote.FromJSON(remoteIt->second.as_object());
	}
}

void MsgHandler_Configuration::LocalFileServerSettings::FromJSON(web::json::object json) {
	auto hostnameIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_LOCAL_HOSTNAME));
	if (hostnameIt != json.end() && hostnameIt->second.is_string()) {
		hostname = utility::conversions::to_utf8string(hostnameIt->second.as_string());
	}

	auto portIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_LOCAL_PORT));
	if (portIt != json.end() && portIt->second.is_number()) {
		port = portIt->second.as_number().to_uint32();
	}

	auto localhostIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_LOCAL_LOCALHOST));
	if (localhostIt != json.end() && localhostIt->second.is_boolean()) {
		localhost = localhostIt->second.as_bool();
	}

	auto runIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_LOCAL_RUNONSTARTUP));
	if (runIt != json.end() && runIt->second.is_boolean()) {
		runOnStartup = runIt->second.as_bool();
	}
}

void MsgHandler_Configuration::RemoteFileServerSettings::FromJSON(web::json::object json) {
	auto hostnameIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_REMOTE_HOSTNAME));
	if (hostnameIt != json.end() && hostnameIt->second.is_string()) {
		hostname = utility::conversions::to_utf8string(hostnameIt->second.as_string());
	}

	auto portIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_REMOTE_PORT));
	if (portIt != json.end() && portIt->second.is_number()) {
		port = portIt->second.as_number().to_uint32();
	}

	auto connectIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_REMOTE_CONNECTONSTARTUP));
	if (connectIt != json.end() && connectIt->second.is_boolean()) {
		connectOnStartup = connectIt->second.as_bool();
	}
}

void MsgHandler_Configuration::FileServerSettings::FromJSON(web::json::object json) {
	auto localIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_LOCAL));
	if (localIt != json.end() && localIt->second.is_object()) {
		local.FromJSON(localIt->second.as_object());
	}

	auto remoteIt = json.find(utility::conversions::to_string_t(PROPERTY_FS_REMOTE));
	if (remoteIt != json.end() && remoteIt->second.is_object()) {
		remote.FromJSON(remoteIt->second.as_object());
	}	
}

void MsgHandler_Configuration::Settings::FromJSON(web::json::object json) {
	auto playerIt = json.find(utility::conversions::to_string_t(PROPERTY_SETTINGS_PLAYER));
	if (playerIt != json.end() && playerIt->second.is_object()) {
		player_.FromJSON(playerIt->second.as_object());
	}

	auto fsIt = json.find(utility::conversions::to_string_t(PROPERTY_SETTINGS_FILESERVER));
	if (fsIt != json.end() && fsIt->second.is_object()) {
		fileServer.FromJSON(fsIt->second.as_object());
	}
}

void MsgHandler_Configuration::LoadConfig() {
	/*auto current = std::experimental::filesystem::current_path();
	auto configPath = current.append(CONFIG_FILE_NAME);*/

	boost::property_tree::ptree tree;

	//if (std::experimental::filesystem::exists(configPath)) {		
	if (FileExists(CONFIG_FILE_NAME.c_str())) {
		try {
			//boost::property_tree::read_json(configPath.string(), tree);
			boost::property_tree::read_json(CONFIG_FILE_NAME, tree);
		}
		catch (...) {
			// we did not manage to read config
		}
	}

	/*** PLAYER SETTINGS ***/
	settings_.player_.local.hostname = tree.get(PATH_PLAYER_LOCAL_HOSTNAME, DEFAULT_PLAYER_LOCAL_HOSTNAME);
	settings_.player_.local.localhost = tree.get(PATH_PLAYER_LOCAL_LOCALHOST, DEFAULT_PLAYER_LOCAL_LOCALHOST);
	settings_.player_.local.port = tree.get(PATH_PLAYER_LOCAL_PORT, DEFAULT_PLAYER_LOCAL_PORT);
	settings_.player_.local.runOnStartup = tree.get(PATH_PLAYER_LOCAL_RUNONSTARTUP, DEFAULT_PLAYER_LOCAL_RUNONSTARTUP);
	settings_.player_.remote.hostname = tree.get(PATH_PLAYER_REMOTE_HOSTNAME, DEFAULT_PLAYER_REMOTE_HOSTNAME);
	settings_.player_.remote.port = tree.get(PATH_PLAYER_REMOTE_PORT, DEFAULT_PLAYER_REMOTE_PORT);
	settings_.player_.remote.connectOnStartup = tree.get(PATH_PLAYER_REMOTE_CONNECTONSTARTUP, DEFAULT_PLAYER_REMOTE_CONNECTONSTARTUP);

	/*** FILESERVER SETTINGS ***/
	settings_.fileServer.local.hostname = tree.get(PATH_FS_LOCAL_HOSTNAME, DEFAULT_FS_LOCAL_HOSTNAME);
	settings_.fileServer.local.localhost = tree.get(PATH_FS_LOCAL_LOCALHOST, DEFAULT_FS_LOCAL_LOCALHOST);
	settings_.fileServer.local.port = tree.get(PATH_FS_LOCAL_PORT, DEFAULT_FS_LOCAL_PORT);
	settings_.fileServer.local.runOnStartup = tree.get(PATH_FS_LOCAL_RUNONSTARTUP, DEFAULT_FS_LOCAL_RUNONSTARTUP);
	settings_.fileServer.remote.hostname = tree.get(PATH_FS_REMOTE_HOSTNAME, DEFAULT_FS_REMOTE_HOSTNAME);
	settings_.fileServer.remote.port = tree.get(PATH_FS_REMOTE_PORT, DEFAULT_FS_REMOTE_PORT);
	settings_.fileServer.remote.connectOnStartup = tree.get(PATH_FS_REMOTE_CONNECTONSTARTUP, DEFAULT_FS_REMOTE_CONNECTONSTARTUP);
}

const std::string MsgHandler_Configuration::PATH_PLAYER_REMOTE_CONNECTONSTARTUP = "config.player.remote.connectOnStart";
const std::string MsgHandler_Configuration::PATH_PLAYER_LOCAL_HOSTNAME = "config.player.local.hostname";
const std::string MsgHandler_Configuration::PATH_PLAYER_LOCAL_PORT = "config.player.local.port";
const std::string MsgHandler_Configuration::PATH_PLAYER_LOCAL_LOCALHOST = "config.player.local.localhost";
const std::string MsgHandler_Configuration::PATH_PLAYER_LOCAL_RUNONSTARTUP = "config.player.local.runOnStart";
const std::string MsgHandler_Configuration::PATH_PLAYER_REMOTE_HOSTNAME = "config.player.remote.hostname";
const std::string MsgHandler_Configuration::PATH_PLAYER_REMOTE_PORT = "config.player.remote.port";
const std::string MsgHandler_Configuration::PATH_FS_REMOTE_CONNECTONSTARTUP = "config.fileServer.remote.connectOnStart";
const std::string MsgHandler_Configuration::PATH_FS_LOCAL_HOSTNAME = "config.fileServer.local.hostname";
const std::string MsgHandler_Configuration::PATH_FS_LOCAL_PORT = "config.fileServer.local.port";
const std::string MsgHandler_Configuration::PATH_FS_LOCAL_LOCALHOST = "config.fileServer.local.localhost";
const std::string MsgHandler_Configuration::PATH_FS_LOCAL_RUNONSTARTUP = "config.fileServer.local.runOnStart";
const std::string MsgHandler_Configuration::PATH_FS_REMOTE_HOSTNAME = "config.fileServer.remote.hostname";
const std::string MsgHandler_Configuration::PATH_FS_REMOTE_PORT = "config.fileServer.remote.port";

const bool MsgHandler_Configuration::DEFAULT_PLAYER_REMOTE_CONNECTONSTARTUP = false;
const std::string MsgHandler_Configuration::DEFAULT_PLAYER_LOCAL_HOSTNAME = "";
const std::uint16_t MsgHandler_Configuration::DEFAULT_PLAYER_LOCAL_PORT = 26331;
const bool MsgHandler_Configuration::DEFAULT_PLAYER_LOCAL_LOCALHOST = true;
const bool MsgHandler_Configuration::DEFAULT_PLAYER_LOCAL_RUNONSTARTUP = true;
const std::string MsgHandler_Configuration::DEFAULT_PLAYER_REMOTE_HOSTNAME = "";
const std::uint16_t MsgHandler_Configuration::DEFAULT_PLAYER_REMOTE_PORT = 26331;
const bool MsgHandler_Configuration::DEFAULT_FS_REMOTE_CONNECTONSTARTUP = false;
const std::string MsgHandler_Configuration::DEFAULT_FS_LOCAL_HOSTNAME = "";
const std::uint16_t MsgHandler_Configuration::DEFAULT_FS_LOCAL_PORT = 26341;
const bool MsgHandler_Configuration::DEFAULT_FS_LOCAL_LOCALHOST = true;
const bool MsgHandler_Configuration::DEFAULT_FS_LOCAL_RUNONSTARTUP = true;
const std::string MsgHandler_Configuration::DEFAULT_FS_REMOTE_HOSTNAME = "";
const std::uint16_t MsgHandler_Configuration::DEFAULT_FS_REMOTE_PORT = 26341;

const std::string MsgHandler_Configuration::PROPERTY_PLAYER_REMOTE_CONNECTONSTARTUP = "connectOnStart";
const std::string MsgHandler_Configuration::PROPERTY_PLAYER_LOCAL_HOSTNAME = "hostname";
const std::string MsgHandler_Configuration::PROPERTY_PLAYER_LOCAL_PORT = "port";
const std::string MsgHandler_Configuration::PROPERTY_PLAYER_LOCAL_LOCALHOST = "localhost";
const std::string MsgHandler_Configuration::PROPERTY_PLAYER_LOCAL_RUNONSTARTUP = "runOnStart";
const std::string MsgHandler_Configuration::PROPERTY_PLAYER_LOCAL = "local";
const std::string MsgHandler_Configuration::PROPERTY_PLAYER_REMOTE_HOSTNAME = "hostname";
const std::string MsgHandler_Configuration::PROPERTY_PLAYER_REMOTE_PORT = "port";
const std::string MsgHandler_Configuration::PROPERTY_PLAYER_REMOTE = "remote";
const std::string MsgHandler_Configuration::PROPERTY_FS_REMOTE_CONNECTONSTARTUP = "connectOnStart";
const std::string MsgHandler_Configuration::PROPERTY_FS_LOCAL_HOSTNAME = "hostname";
const std::string MsgHandler_Configuration::PROPERTY_FS_LOCAL_PORT = "port";
const std::string MsgHandler_Configuration::PROPERTY_FS_LOCAL_LOCALHOST = "localhost";
const std::string MsgHandler_Configuration::PROPERTY_FS_LOCAL_RUNONSTARTUP = "runOnStart";
const std::string MsgHandler_Configuration::PROPERTY_FS_LOCAL = "local";
const std::string MsgHandler_Configuration::PROPERTY_FS_REMOTE_HOSTNAME = "hostname";
const std::string MsgHandler_Configuration::PROPERTY_FS_REMOTE_PORT = "port";
const std::string MsgHandler_Configuration::PROPERTY_FS_REMOTE = "remote";
const std::string MsgHandler_Configuration::PROPERTY_SETTINGS_PLAYER = "player";
const std::string MsgHandler_Configuration::PROPERTY_SETTINGS_FILESERVER = "fileServer";

 const std::string MsgHandler_Configuration::CONFIG_FILE_NAME = "config.json";