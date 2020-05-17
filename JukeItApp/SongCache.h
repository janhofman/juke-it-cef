#ifndef SONG_CACHE_H_
#define SONG_CACHE_H_

#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates

#include "cpprest/json.h"
#include "cpprest/http_client.h"
#include "cpprest/uri.h"
#include "cpprest/asyncrt_utils.h"
#include "pplx/pplxtasks.h"
#include "cpprest/http_msg.h"
#include "cpprest/containerstream.h"

#include <boost/interprocess/streams/bufferstream.hpp>

#include <memory>
#include <string>
#include <chrono>
#include <vector>
#include <thread>
#include <unordered_map>
#include <exception>

namespace MusicPlayer {
	typedef Concurrency::streams::container_buffer<std::vector<uint8_t>> AsyncBuffer;

	inline utility::string_t String_t(const char * str) {
		return utility::conversions::to_string_t(str);
	}
	inline utility::string_t String_t(const std::string& str) {
		return utility::conversions::to_string_t(str);
	}

	class SongCacheItem : public std::enable_shared_from_this<SongCacheItem>
	{
	public:
		SongCacheItem(const std::string& itemId) : itemId_(itemId) {};
		void MakeReady();
		inline AsyncBuffer& GetBuffer() {
			return asyncBuffer_;
		}
		inline std::basic_istream<std::uint8_t>& GetStream() {
			return *is_;
		}
		inline std::string GetItemId() {
			return itemId_;
		}
		inline bool IsReady() {
			return ready_;
		}
		inline bool IsFailed() {
			return failed_;
		}
		inline void Fail() {
			failed_ = true;
		}
		inline bool IsCancelled() {
			return cancelled_;
		}
		inline void Cancel() {
			cancelled_ = true;
		}
		~SongCacheItem() {
			if (is_.get() != nullptr) {
				is_.reset();
			}
			if (asyncBuffer_.is_open()) {
				asyncBuffer_.close();
			}
		}
	private:
		AsyncBuffer asyncBuffer_;
		bool ready_ = false;
		bool cancelled_ = false;
		bool failed_ = false;
		const std::string itemId_;
		std::unique_ptr<std::basic_istream<std::uint8_t>> is_;
	};

	typedef std::shared_ptr<SongCacheItem> SongPtr;

	class SongCache {
	public:
		SongCache(const std::string& url)
			: httpClient_(utility::conversions::to_string_t(url)) {};

		struct QueueItem {
			std::string songId;
			std::string itemId;
		};

		SongPtr NextSong();
		void Reset();
		void UpdateQueue(const std::vector<QueueItem>& newQueue);
		bool TestConnection();

		inline bool HasEnoughSongs() {
			return queue_.size() >= 3;
		}

		// exceptions
		class FileserverDisconnectedException;
		class FailedToLoadSongException;
		class EmptyQueueException;
	private:
		void GetSongAsync(const std::string& songId, SongPtr songPtr);
		void AddToCache(const std::string& songId, const std::string& itemId);
		void UpdateCache();

		std::vector<QueueItem> queue_;
		std::unordered_map<std::string, SongPtr> cache_;
		web::http::client::http_client httpClient_;
	};

	class SongCache::FileserverDisconnectedException : public std::exception {
	private:
		std::string message_;
	public:
		explicit FileserverDisconnectedException(const std::string& message) : message_(message) {};
		FileserverDisconnectedException() : FileserverDisconnectedException("Fileserver has disconnected.") {};
		const char* what() const noexcept override {
			return message_.c_str();
		}
	};

	class SongCache::FailedToLoadSongException : public std::exception {
	private:
		std::string message_;
		std::string songId_;
		std::string itemId_;
	public:
		FailedToLoadSongException(const std::string& songId, const std::string& itemId) : songId_(songId), itemId_(itemId) {
			std::stringstream ss;
			ss << "Song failed to load from fileserver." << std::endl
				<< "Song ID: " << songId_ << std::endl
				<< "Item ID: " << itemId_;

			message_ = ss.str();
		}
		const char* what() const noexcept override {
			return message_.c_str();
		}
		const std::string& songId() const {
			return songId_;
		}
		const std::string& itemId() const {
			return itemId_;
		}
	};

	class SongCache::EmptyQueueException : public std::exception {
	private:
		std::string message_ = "Song queue is empty";
	public:
		const char* what() const noexcept override {
			return message_.c_str();
		}
	};
}
#endif