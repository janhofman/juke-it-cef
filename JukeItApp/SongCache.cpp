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
				throw (int)response.status_code();
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
			catch (...) {
				songPtr->Fail();
			}
		});
	}

	/*
	SongPtr SongCache::NextSong() {
		// first check if we have ready a song in order queue
		if (orderQueue_.size() > 0) {
			auto item = orderQueue_[0];
			auto it = cache_.find(item.itemId);
			if (it != cache_.end()) {
				if (it->second->IsReady()) {
					// hold the pointer and remove it from cache
					auto songPtr = it->second->shared_from_this();
					cache_.erase(item.itemId);
					// remove it from queue
					orderQueue_.erase(orderQueue_.begin());
					// load next song if there is any
					if (orderQueue_.size() >= 2) {
						AddToCache(orderQueue_[1].songId, orderQueue_[1].itemId);
					}
					// return the pointer
					return songPtr;
				}
				// else: orderQueue top is not ready, so we fallback to playlist queue
			}
			else {
				// we didn't find the song in cache. This should not happen, but if it occurs, we just put it there
				AddToCache(item.songId, item.itemId);
			}
		}
		// song in order queue wasn't available, so we play from playlist queue
		if (playlistQueue_.size() > 0) {
			auto item = playlistQueue_[0];
			auto it = cache_.find(item.itemId);
			if (it != cache_.end()) {
				if (it->second->IsReady()) {
					// hold the pointer and remove it from cache
					auto songPtr = it->second->shared_from_this();
					cache_.erase(item.itemId);
					// remove it from queue
					playlistQueue_.erase(playlistQueue_.begin());
					// load next song if there is any
					if (playlistQueue_.size() >= 2) {
						AddToCache(playlistQueue_[1].songId, playlistQueue_[1].itemId);
					}
					// return the pointer
					return songPtr;
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
		// TODO: both queues are empty, throw an exception
		throw 123;
	}
	*/

	SongPtr SongCache::NextSong() {
		// check if we have ready a song in queue
		if (queue_.size() > 0) {
			auto item = queue_[0];
			auto it = cache_.find(item.itemId);
			if (it != cache_.end()) {
				if (it->second->IsReady()) {
					// hold the pointer and remove it from cache
					auto songPtr = it->second->shared_from_this();
					cache_.erase(item.itemId);
					// remove it from queue
					queue_.erase(queue_.begin());
					// load next song if there is any
					UpdateCache();
					// return the pointer
					return songPtr;
				}
				else {
					if (it->second->IsFailed() || it->second->IsCancelled()) {
						if (it->second->IsFailed()) {
							// TODO: report failed song and verify connection to fileServer
						}						
						// remove it from queue
						cache_.erase(item.itemId);
						queue_.erase(queue_.begin());

						return NextSong();
					} 
					else {
						// we don't have any song ready, we must wait for it to get buffered
						std::this_thread::sleep_for(std::chrono::seconds(1));
						return NextSong();
					}
				}
			}
			else {
				// we didn't find the song in cache. This should not happen, but if it occurs, we just put it there
				AddToCache(item.songId, item.itemId);
				// call ourselves recursively, this time the first item is available in cache
				return NextSong();
			}
		}
		throw 123;
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
		// check first three elements and verfy that they are being cached
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


	/*
	void SongCache::AddToOrderQueue(const std::string& songId, const std::string& itemId) {
		QueueItem q;
		q.songId = songId;
		q.itemId = itemId;

		// if there are less than 2 items in the order queue, we should load it right away
		bool shouldLoad = orderQueue_.size() < 2;
		orderQueue_.push_back(q);
		if (shouldLoad) {
			AddToCache(songId, itemId);
		}
	}

	void SongCache::AddToPlaylistQueue(const std::string& songId, const std::string& itemId) {
		QueueItem q;
		q.songId = songId;
		q.itemId = itemId;

		// if there are less than 2 items in the order queue, we should load it right away
		bool shouldLoad = playlistQueue_.size() < 2;
		playlistQueue_.push_back(q);
		if (shouldLoad) {
			AddToCache(songId, itemId);
		}
	}
	*/

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