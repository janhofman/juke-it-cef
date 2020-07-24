#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates
#include <algorithm>
#include <string>
#include <iostream>
#include "MusicPlayerAPI.h"
#include "boost/asio/ip/address.hpp"
#include "pplx/pplxtasks.h"

#include "rest.h"
#include "FileServerHandler.h"
#include "SqliteAPI.h"

extern "C" {
#include "tinyfiledialogs.h"
}

int main(int argc, char **argv) {	
	bool readAddress = false;
	bool readPort = false;
	std::string address;
	std::string port;

	for (int i = 1; i < argc; ++i) {
		auto arg = std::string(argv[i]);
		std::transform(arg.begin(), arg.end(), arg.begin(), [](unsigned char c) { return std::tolower(c); });

		if (readAddress) {
			address = arg;
			readAddress = false;
		}
		else if (readPort) {
			port = arg;
			readPort = false;
		}
		else if (arg == "/a" ||
			arg == "/address" ||
			arg == "-a" ||
			arg == "--address") {
			readAddress = true;
		}
		else if (arg == "/p" ||
			arg == "/port" ||
			arg == "-p" ||
			arg == "--port") {
			readPort = true;
		}
	}

	if (port.empty()) {
		std::cerr << "Port parameter is missing" << std::endl;
	}
	else if (address.empty()) {
		std::cerr << "Address parameter is missing" << std::endl;
	}
	else {
		// parse address
		boost::system::error_code err;
		boost::asio::ip::address ip;
		if (address == "localhost") {
			ip = boost::asio::ip::address_v4::loopback();
		}
		else {
			ip = boost::asio::ip::make_address(address, err);
		}
		if (err.value() == 0) {
			// parse port
			if (port.length() <= 5) {
				int tmp = 0;
				bool valid = true;
				for (size_t i = 0; i < port.length(); i++)
				{
					if (isdigit(port[i])) {
						tmp *= 10;
						tmp += port[i] - '0';
					}
					else {
						valid = false;
						break;
					}
				}
				if (valid && tmp < 65536) {
					std::uint16_t portNumber = tmp;

					std::stringstream ss;
					ss << "http://" << ip.to_string() << ":" << portNumber << "/api";

					SqliteAPI sqlite;
					FileServerHandler fsHandler(&sqlite);
					FileServerAPI api(ss.str(), &fsHandler);
					auto task = api.open();
					task.wait();
					try
					{
						task.get();
					}
					catch (...)
					{
						// reset pointers
						std::cout << "Fileserver module failed to open." << std::endl;
						return -1;
					}

					std::cout << "Fileserver module has started." << std::endl << "Type \"end\" to close." << std::endl;
					std::string userInput;
					do
					{
						std::getline(std::cin, userInput);
						if (userInput == "end") {
							api.close();
							break;
						}
					} while (true);
				}
				else {
					std::cerr << "Port parameter is not a valid number in range 1 - 65535" << std::endl;
				}
			}
			else {
				std::cerr << "Port parameter is too long" << std::endl;
			}
		}			
		else {
			std::cerr << "Address parameter is invalid" << std::endl;
		}
	}
	return 0;
}