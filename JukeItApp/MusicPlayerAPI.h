#ifndef MUSIC_PLAYER_API_H_
#define MUSIC_PLAYER_API_H_

#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates

#include "cpprestsdk/include/cpprest/json.h"

#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/bind_executor.hpp>
#include <boost/asio/strand.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <boost/interprocess/streams/bufferstream.hpp>

#include <memory>
#include <string>
#include <queue>
#include <mutex>

#include "MusicPlayer.h"
#include "SongCache.h"

using tcp = boost::asio::ip::tcp;               // from <boost/asio/ip/tcp.hpp>
namespace websocket = boost::beast::websocket;  // from <boost/beast/websocket.hpp>

namespace MusicPlayer {
	class Session : public std::enable_shared_from_this<Session>
	{
	public:
		// Take ownership of the socket
		explicit Session(tcp::socket socket) : ws_(std::move(socket)), strand_(ws_.get_executor()) {}
		// Start the asynchronous operation
		void Run();
		// closes session synchronously
		inline void Close(websocket::close_reason& closeReason) {
			DoClose(closeReason);
		}
		inline bool IsClosed() {
			return closed_;
		};
		~Session() {};
		

	private:
		// websocket properties
		websocket::stream<tcp::socket> ws_;
		boost::asio::strand<boost::asio::io_context::executor_type> strand_;
		boost::beast::multi_buffer buffer_;
		boost::beast::multi_buffer writeBuffer_;
		std::queue<std::string> writeQueue_;
		std::uint8_t failCounter_ = 0;
		bool writing_ = false;
		bool closed_ = false;
		// player properties
		MusicPlayer player_;
		std::unique_ptr<SongCache> cache_;
		bool playing_ = false;
		bool waitingForQueue_ = false;
		SongPtr currentSong_;

		static const std::string TYPE_REQUEST;
		static const std::string TYPE_RESPONSE;

		enum ActionEnum {
			PLAY,
			PAUSE,
			NEXT,
			RESET,
			CLOSE,
			
			INITIALIZE,
			SEEK,
			VOLUME,
			UPDATE_QUEUE,

			NOT_SUPPORTED
		};

		enum ResponseErrorCode {
			OK = 0,
			NOT_SUPPORTED_ACTION = 11,
			MALFORMED_REQUEST = 12,
			FILESERVER_NOT_SET = 13,
			EMPTY_QUEUES = 21,
			FILESERVER_UNREACHABLE = 55
		};

		//webSocket methods
		void OnAccept(boost::system::error_code ec);
		void DoRead();
		void OnRead(boost::system::error_code ec, std::size_t bytes_transferred);
		void DoWrite();
		void OnWrite(boost::system::error_code ec, std::size_t bytes_transferred);
		void OnClose();
		void DoClose(const boost::beast::websocket::close_reason& closeReason);
		void HandleRequest(const web::json::object& body);

		// actions
		ResponseErrorCode PlayAction();
		ResponseErrorCode PauseAction();
		ResponseErrorCode NextAction();
		ResponseErrorCode CloseAction();
		ResponseErrorCode ResetAction();
		ResponseErrorCode InitializeAction(const web::json::object& payload);
		ResponseErrorCode VolumeAction(const web::json::object& payload);
		ResponseErrorCode SeekAction(const web::json::object& payload);
		ResponseErrorCode UpdateQueueAction(const web::json::object& payload);

		void RequestPlaylistSong();
		void SendStatus(bool playing, int timestamp);
		bool TryParseQueue(const web::json::object& payload, std::vector<SongCache::QueueItem>& outQueue);
		// this function just handles raw song opening, calling function must verify 
		// cache existence and catch exception caused by empty cache
		void OpenNextSong();

		ActionEnum GetAction(const std::string& action);
		void SendResponse(ResponseErrorCode responseCode, const web::json::value& id);
		void SendNotification(const std::string& action);
		void SendNotification(const std::string& action, const web::json::value& payload);
		//void Error(ResponseErrorCode errCode);
		
	};

	// Accepts incoming connections and launches the sessions
	class Listener : public std::enable_shared_from_this<Listener>
	{
	public:
		Listener(boost::asio::io_context& ioc, tcp::endpoint endpoint);
		// Start accepting incoming connections
		void Run();
		void DoAccept();
		void OnAccept(boost::system::error_code ec);
		void Close();

		~Listener() {};
	private:
		void RejectConnection();

		tcp::acceptor acceptor_;
		tcp::socket socket_;
		std::shared_ptr<Session> sessionPtr_;
	};

	class API 
	{
	public:
		void Start(const boost::asio::ip::address &address, std::uint16_t port);
		void Close();
		inline bool IsRunning() {
			return running_;
		}
		inline std::string GetAddress() {
			return address_;
		}
	private:
		std::shared_ptr<Listener> listener_;
		std::shared_ptr<boost::asio::io_context> ioContext_;
		std::shared_ptr<std::thread> thread_;
		bool running_ = false;
		std::mutex mutex;
		std::string address_;
	};
}

#endif