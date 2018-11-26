#ifndef MUSIC_PLAYER_API_H_
#define MUSIC_PLAYER_API_H_

#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates

#include "cpprestsdk/include/cpprest/json.h"
#include "cpprestsdk/include/cpprest/http_client.h"
#include "cpprestsdk/include/cpprest/uri.h"
#include "cpprestsdk/include/cpprest/asyncrt_utils.h"
#include "cpprestsdk/include/pplx/pplxtasks.h"
#include "cpprestsdk/include/cpprest/http_msg.h"
#include "cpprestsdk/include/cpprest/containerstream.h"

#include <boost/beast/core.hpp>
#include <boost/beast/websocket.hpp>
#include <boost/asio/bind_executor.hpp>
#include <boost/asio/strand.hpp>
#include <boost/asio/ip/tcp.hpp>
#include <algorithm>
#include <cstdlib>
#include <functional>
#include <iostream>
#include <memory>
#include <string>
#include <thread>
#include <vector>
#include <unordered_map>
#include <queue>

#include "MusicPlayer.h"

using tcp = boost::asio::ip::tcp;               // from <boost/asio/ip/tcp.hpp>
namespace websocket = boost::beast::websocket;  // from <boost/beast/websocket.hpp>

namespace MusicPlayer {
	typedef Concurrency::streams::container_buffer<std::vector<uint8_t>> AsyncBuffer;

	class Session : public std::enable_shared_from_this<Session>
	{
	public:
		// Take ownership of the socket
		explicit Session(tcp::socket socket) : ws_(std::move(socket)), strand_(ws_.get_executor())
		{}
		// Start the asynchronous operation
		void Run();
		void OnAccept(boost::system::error_code ec);
		void DoRead();
		void OnRead(boost::system::error_code ec, std::size_t bytes_transferred);
		void OnWrite(boost::system::error_code ec, std::size_t bytes_transferred);
		void HandleRequest(const web::json::value& body);
		void HandleResponse(const web::json::value& body);

	private:
		websocket::stream<tcp::socket> ws_;
		boost::asio::strand<boost::asio::io_context::executor_type> strand_;
		boost::beast::multi_buffer buffer_;
		MusicPlayer player_;
		std::queue<std::shared_ptr<AsyncBuffer>> queue_;

		static const std::string TYPE_REQUEST;
		static const std::string TYPE_RESPONSE;

		enum ActionEnum {
			PLAY,

			NOT_SUPPORTED
		};

		enum ResponseErrorCode {
			OK = 0,
			NOT_SUPPORTED_ACTION = 11
		};

		ActionEnum GetAction(const std::string& action);
		web::json::value CreateResponse(ResponseErrorCode code);
		web::json::value CreateResponse(ResponseErrorCode code, const web::json::value& response);
		inline utility::string_t String_t(const char * str) {
			return utility::conversions::to_string_t(str);
		}
		inline utility::string_t String_t(const std::string& str) {
			return utility::conversions::to_string_t(str);
		}
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

	private:
		tcp::acceptor acceptor_;
		tcp::socket socket_;
	};

	class API 
	{
	public:
		void Start(const boost::asio::ip::address &address, std::uint16_t port, std::uint32_t threads);
	private:
		std::shared_ptr<Listener> listener_;
		std::shared_ptr<boost::asio::io_context> ioContext_;
		std::vector<std::thread> threadpool_;
	};

}

#endif