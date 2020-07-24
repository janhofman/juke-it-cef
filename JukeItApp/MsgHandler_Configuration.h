#ifndef MSG_HANDLER_CONFIGURATION_H_
#define MSG_HANDLER_CONFIGURATION_H_

#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates

#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <boost/foreach.hpp>
#include <string>
#include <filesystem>

#include "abstract_message_handler.h"

class MsgHandler_Configuration : public AbstractMessageHandler {
public:
	explicit MsgHandler_Configuration(const CefString& startup_url);

	bool OnQuery(CefRefPtr<CefBrowser> browser,
		CefRefPtr<CefFrame> frame,
		int64 query_id,
		const CefString& request,
		bool persistent,
		CefRefPtr<Callback> callback) override;

	~MsgHandler_Configuration() {}

private:
	struct AbstractSettings {
		virtual web::json::value ToJSON() = 0;
		virtual void FromJSON(web::json::object json) = 0;
	};

	struct LocalPlayerSettings : public AbstractSettings {
		std::string hostname;
		std::uint16_t port;
		bool localhost;
		bool runOnStartup;

		web::json::value ToJSON() override;
		void FromJSON(web::json::object json) override;
	};

	struct RemotePlayerSettings : public AbstractSettings {
		std::string hostname;
		std::uint16_t port;
		bool connectOnStartup;

		web::json::value ToJSON() override;
		void FromJSON(web::json::object json) override;
	};

	struct PlayerSettings : public AbstractSettings {
		LocalPlayerSettings local;
		RemotePlayerSettings remote;

		web::json::value ToJSON() override;
		void FromJSON(web::json::object json) override;
	};

	struct LocalFileServerSettings : public AbstractSettings {
		std::string hostname;
		std::uint16_t port;
		bool localhost;
		bool runOnStartup;

		web::json::value ToJSON() override;
		void FromJSON(web::json::object json) override;
	};

	struct RemoteFileServerSettings : public AbstractSettings {
		std::string hostname;
		std::uint16_t port;
		bool connectOnStartup;

		web::json::value ToJSON() override;
		void FromJSON(web::json::object json) override;
	};

	struct FileServerSettings : public AbstractSettings {
		LocalFileServerSettings local;
		RemoteFileServerSettings remote;

		web::json::value ToJSON() override;
		void FromJSON(web::json::object json) override;
	};

	struct Settings : public AbstractSettings {
		PlayerSettings player_;
		FileServerSettings fileServer;

		web::json::value ToJSON() override;
		void FromJSON(web::json::object json) override;
	};
	enum CommandName {
		GET_CONFIG,
		SAVE_CONFIG,

		NOT_SUPPORTED
	};

	enum ReturnCode {
		OK = 0,
		FAILED_TO_OPEN = 1,
		ALREADY_RUNNING = 2,
		BAD_REQUEST = 5,
	};

	CommandName GetCommandName(const web::json::value& request);
	void LoadConfig();
	void SaveConfig(web::json::value request, CefRefPtr<Callback> callback);
	void GetConfig(CefRefPtr<Callback> callback);

	Settings settings_;
	bool settingsLoaded_ = false;
	const CefString startup_url_;

	static const std::string PATH_PLAYER_REMOTE_CONNECTONSTARTUP;
	static const std::string PATH_PLAYER_LOCAL_HOSTNAME;
	static const std::string PATH_PLAYER_LOCAL_PORT;
	static const std::string PATH_PLAYER_LOCAL_LOCALHOST;
	static const std::string PATH_PLAYER_LOCAL_RUNONSTARTUP;
	static const std::string PATH_PLAYER_REMOTE_HOSTNAME;
	static const std::string PATH_PLAYER_REMOTE_PORT;
	static const std::string PATH_FS_REMOTE_CONNECTONSTARTUP;
	static const std::string PATH_FS_LOCAL_HOSTNAME;
	static const std::string PATH_FS_LOCAL_PORT;
	static const std::string PATH_FS_LOCAL_LOCALHOST;
	static const std::string PATH_FS_LOCAL_RUNONSTARTUP;
	static const std::string PATH_FS_REMOTE_HOSTNAME;
	static const std::string PATH_FS_REMOTE_PORT;

	static const bool DEFAULT_PLAYER_REMOTE_CONNECTONSTARTUP;
	static const std::string DEFAULT_PLAYER_LOCAL_HOSTNAME;
	static const std::uint16_t DEFAULT_PLAYER_LOCAL_PORT;
	static const bool DEFAULT_PLAYER_LOCAL_LOCALHOST;
	static const bool DEFAULT_PLAYER_LOCAL_RUNONSTARTUP;
	static const std::string DEFAULT_PLAYER_REMOTE_HOSTNAME;
	static const std::uint16_t DEFAULT_PLAYER_REMOTE_PORT;
	static const bool DEFAULT_FS_REMOTE_CONNECTONSTARTUP;
	static const std::string DEFAULT_FS_LOCAL_HOSTNAME;
	static const std::uint16_t DEFAULT_FS_LOCAL_PORT;
	static const bool DEFAULT_FS_LOCAL_LOCALHOST;
	static const bool DEFAULT_FS_LOCAL_RUNONSTARTUP;
	static const std::string DEFAULT_FS_REMOTE_HOSTNAME;
	static const std::uint16_t DEFAULT_FS_REMOTE_PORT;

	static const std::string PROPERTY_PLAYER_REMOTE_CONNECTONSTARTUP;
	static const std::string PROPERTY_PLAYER_LOCAL_HOSTNAME;
	static const std::string PROPERTY_PLAYER_LOCAL_PORT;
	static const std::string PROPERTY_PLAYER_LOCAL_LOCALHOST;
	static const std::string PROPERTY_PLAYER_LOCAL_RUNONSTARTUP;
	static const std::string PROPERTY_PLAYER_LOCAL;
	static const std::string PROPERTY_PLAYER_REMOTE_HOSTNAME;
	static const std::string PROPERTY_PLAYER_REMOTE_PORT;
	static const std::string PROPERTY_PLAYER_REMOTE;
	static const std::string PROPERTY_FS_REMOTE_CONNECTONSTARTUP;
	static const std::string PROPERTY_FS_LOCAL_HOSTNAME;
	static const std::string PROPERTY_FS_LOCAL_PORT;
	static const std::string PROPERTY_FS_LOCAL_LOCALHOST;
	static const std::string PROPERTY_FS_LOCAL_RUNONSTARTUP;
	static const std::string PROPERTY_FS_LOCAL;
	static const std::string PROPERTY_FS_REMOTE_HOSTNAME;
	static const std::string PROPERTY_FS_REMOTE_PORT;
	static const std::string PROPERTY_FS_REMOTE;
	static const std::string PROPERTY_SETTINGS_PLAYER;
	static const std::string PROPERTY_SETTINGS_FILESERVER;

	static const std::string CONFIG_FILE_NAME;

	DISALLOW_COPY_AND_ASSIGN(MsgHandler_Configuration);
};

#endif