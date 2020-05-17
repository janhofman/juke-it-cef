#include "SongCache.h"

namespace MusicPlayer {

	void SongCacheItem::MakeReady() {
		ready_ = true;
		auto& vct = asyncBuffer_.collection();
		is_ = std::make_unique<boost::interprocess::basic_bufferstream<std::uint8_t>>(vct.data(), vct.size());
	}

	void SongCache::GetSongAsync(const std::string& songId, SongPtr songPtr) {
		// create a task that gets a song and sets it to ready state once it's downloaded
		auto path = String_t("/v1/download/songs/" + songId);
		auto task = httpClient_.request(web::http::methods::GET, path)
			.then([=](web::http::http_response response) {
				if (response.status_code() == web::http::status_codes::OK) {
					return response.body().read_to_end(songPtr->GetBuffer());
				}
				else {
					// TODO: throw an exception
					throw std::exception();
				}
			}).then([=](pplx::task<size_t> t) {
				try {
					// call get to verify that the download was successful
					t.get();

					// FOR TESTING ONLY - simulates buffering
					//std::this_thread::sleep_for(std::chrono::seconds(20));

					if (!songPtr->IsCancelled()) {
						// set song ready as it would throw otherwise
						songPtr->MakeReady();
					}
				}
				catch (const std::exception&) {
					songPtr->Fail();
				}
			});
	}

	SongPtr SongCache::NextSong() {
		// check if we have ready a song in queue
		if (queue_.size() > 0) {
			auto item = queue_[0];
			auto itemId = item.itemId;
			auto songId = item.songId;
			auto it = cache_.find(itemId);
			if (it != cache_.end()) {
				// hold the pointer and remove it from cache
				auto songPtr = it->second->shared_from_this();
				cache_.erase(itemId);
				// remove it from queue
				queue_.erase(queue_.begin());
				// load next song if there is any
				UpdateCache();

				if (songPtr->IsReady()) {
					// return the pointer
					return songPtr;
				}
				else if (songPtr->IsCancelled()) {
					// return recursively
					return NextSong();
				}
				else if (songPtr->IsFailed()) {
					// verify that fileserver is still running
					if (TestConnection()) {
						throw FailedToLoadSongException(songId, itemId);
					}
					else {
						throw FileserverDisconnectedException();
					}
				}
				else {
					// we don't have any song ready, we must wait for it to get buffered
					std::this_thread::sleep_for(std::chrono::seconds(1));
					return NextSong();
				}
			}
			else {
				// we didn't find the song in cache. This should not happen, but if it occurs, we just put it there
				AddToCache(item.songId, item.itemId);
				// call ourselves recursively, this time the first item is available in cache
				return NextSong();
			}
		}
		else {
			throw SongCache::EmptyQueueException();
		}
	}

	void SongCache::UpdateQueue(const std::vector<SongCache::QueueItem>& newQueue) {
		queue_.clear();
		for (size_t i = 0; i < newQueue.size(); i++)
		{
			queue_.push_back(newQueue[i]);
		}

		UpdateCache();
	}

	void SongCache::UpdateCache() {
		// check first three elements and verify that they are being cached
		for (size_t i = 0; i < queue_.size() && i < 3; i++)
		{
			auto it = cache_.find(queue_[i].itemId);
			if (it == cache_.end()) {
				// item not found, we need to cache it
				AddToCache(queue_[i].songId, queue_[i].itemId);
			}
		}

		// if there are more than 5 items in queue, remove all that are not on first 5 places
		if (cache_.size() > 5) {
			std::vector<std::string> keys;
			keys.reserve(cache_.size());

			for (auto it = cache_.begin(); it != cache_.end(); it++)
			{
				keys.push_back(it->first);
			}

			// detect missing keys
			for (size_t i = 0; i < queue_.size() && i < 5; i++)
			{
				auto item = queue_[i].itemId;
				if (cache_.find(item) != cache_.end()) {
					for (auto it = keys.begin(); it != keys.end(); it++)
					{
						if (*it == item) {
							keys.erase(it);
							break;
						}
					}
				}
			}

			// remove inconvenient cache items
			for (auto it = keys.begin(); it != keys.end(); it++)
			{
				auto songToRemove = cache_.find(*it);
				songToRemove->second->Cancel(); // cancel in any case
				cache_.erase(*it);
			}
		}
	}

	void SongCache::AddToCache(const std::string& songId, const std::string& itemId) {
		// first make sure the song isn't there already, find is O(1) so it's cheap safety measure
		if (cache_.find(itemId) == cache_.end()) {
			// create a ptr in cache
			SongPtr ptr = std::make_shared<SongCacheItem>(itemId);
			cache_[itemId] = ptr->shared_from_this();
			// fill the ptr
			GetSongAsync(songId, ptr->shared_from_this());
		}
	}

	void SongCache::Reset() {
		for (auto it = cache_.begin(); it != cache_.end(); it++) {
			auto song = it->second;
			if (!song->IsFailed() && !song->IsReady()) {
				// it is still running, we need to cancel it first
				song->Cancel();
			}
		}
		// Remove all cache items
		// Since they are shared_ptr and the only reference is in cache_ or task, they will deallocate themselves
		cache_.clear();

		queue_.clear();
	}

	bool SongCache::TestConnection() {
		auto path = String_t("/v1/ping");
		try {
			auto task = httpClient_.request(web::http::methods::GET, path)
				.then([=](web::http::http_response response) {
				if (response.status_code() == web::http::status_codes::OK) {
					return true;
				}
				else {
					return false;
				}
			});
			task.wait();
			return task.get();
		}
		catch (...) {
			return false;
		}
	}
}