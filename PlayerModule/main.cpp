#include <vector>
#include <algorithm>
#include <string>
#include <iostream>
#include "MusicPlayerAPI.h"
#include "boost/asio/ip/address.hpp"

// https://stackoverflow.com/questions/865668/how-to-parse-command-line-arguments-in-c
class InputParser {
public:
	InputParser(int &argc, char **argv) {
		for (int i = 1; i < argc; ++i)
			this->tokens.push_back(std::string(argv[i]));
	}

	bool Parse() {

	}

	const std::string& getCmdOption(const std::string &option) const {
		std::vector<std::string>::const_iterator itr;
		itr = std::find(this->tokens.begin(), this->tokens.end(), option);
		if (itr != this->tokens.end() && ++itr != this->tokens.end()) {
			return *itr;
		}
		static const std::string empty_string("");
		return empty_string;
	}

	bool cmdOptionExists(const std::string &option) const {
		return std::find(this->tokens.begin(), this->tokens.end(), option)
			!= this->tokens.end();
	}
private:
	std::vector <std::string> tokens;
	std::string address;
	std::string port;
};

int main(int argc, char **argv) {	
	bool readAddress = false;
	bool readPort = false;
	std::string address;
	std::string port;

	for (int i = 1; i < argc; ++i) {
		auto arg = std::string(argv[i]);
		std::transform(arg.begin(), arg.end(), arg.begin(), std::tolower);

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

					MusicPlayer::API api;
					api.Start(ip, portNumber);

					std::cout << "Player module has started." << std::endl << "Type \"end\" to close." << std::endl;
					std::string userInput;
					do
					{
						std::getline(std::cin, userInput);
						if (userInput == "end") {
							api.Close();
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