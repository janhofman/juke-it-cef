#ifndef SONG_CACHE_H_
#define SONG_CACHE_H_

#define _TURN_OFF_PLATFORM_STRING // we need to turn this off, because the U() macro from cpprest it messes up some boost templates

#include "cpprestsdk/include/cpprest/json.h"
#include "cpprestsdk/include/cpprest/http_client.h"
#include "cpprestsdk/include/cpprest/uri.h"
#include "cpprestsdk/include/cpprest/asyncrt_utils.h"
#include "cpprestsdk/include/pplx/pplxtasks.h"
#include "cpprestsdk/include/cpprest/http_msg.h"
#include "cpprestsdk/include/cpprest/containerstream.h"

#include <boost/interprocess/streams/bufferstream.hpp>

#include <memory>
#include <string>
#include <chrono>
#include <vector>
#include <unordered_map>

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
		//void AddToOrderQueue(const std::string& songId, const std::string& itemId);
		//void AddToPlaylistQueue(const std::string& songId, const std::string& itemId);
		void Reset();
		void UpdateQueue(const std::vector<QueueItem>& newQueue);
		bool TestConnection();

		inline bool HasEnoughSongs() {
			return queue_.size() >= 3;
		}
	private:
		void GetSongAsync(const std::string& songId, SongPtr songPtr);
		void AddToCache(const std::string& songId, const std::string& itemId);
		void UpdateCache();

		std::vector<QueueItem> orderQueue_;
		std::vector<QueueItem> playlistQueue_;
		std::vector<QueueItem> queue_;
		std::unordered_map<std::string, SongPtr> cache_;
		web::http::client::http_client httpClient_;
	};
}
#endif