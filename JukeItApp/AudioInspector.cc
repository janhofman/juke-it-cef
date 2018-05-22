#include "AudioInspector.h"

AudioInspector::AudioInspector() {
	av_register_all();
}

bool AudioInspector::GetMetadata(const char * filename, SongMetadata *song) {
	AVStream *aud_stream = NULL;
	AVFormatContext *ctx_format = NULL;
	bool rtc = false;	

	if (avformat_open_input(&ctx_format, filename, nullptr, nullptr) == 0) {
		if (avformat_find_stream_info(ctx_format, nullptr) >= 0) {
			for (unsigned int i = 0; i < ctx_format->nb_streams; i++) {
				if (ctx_format->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_AUDIO) {
					aud_stream = ctx_format->streams[i];
					break;
				}
			}
			if (aud_stream != nullptr) {
				bool artist, title, album, genre;
				artist = title = album = genre = true;

				// first read file metadata
				auto metadata = ctx_format->metadata;
				int size = av_dict_count(metadata);
				AVDictionaryEntry *val = NULL;
				for (size_t i = 0; i < size; i++)
				{
					val = av_dict_get(metadata, "", val, AV_DICT_IGNORE_SUFFIX);
					if (title && CompareStringIgnoreCase(val->key, "title")) {
						song->title = val->value;
						title = false;
					}
					else if (artist && CompareStringIgnoreCase(val->key, "artist")) {
						song->artist = val->value;
						artist = false;
					}
					else if (album && CompareStringIgnoreCase(val->key, "album")) {
						song->album = val->value;
						album = false;
					}
					else if (genre && CompareStringIgnoreCase(val->key, "genre")) {
						song->genre = val->value;
						genre = false;
					}
				}

				if (title || artist || album || genre) {
					// check stream metadata
					metadata = aud_stream->metadata;
					size = av_dict_count(metadata);
					val = NULL;
					for (size_t i = 0; i < size; i++)
					{
						val = av_dict_get(metadata, "", val, AV_DICT_IGNORE_SUFFIX);
						if (title && CompareStringIgnoreCase(val->key, "title")) {
							song->title = val->value;
							title = false;
						}
						else if (artist && CompareStringIgnoreCase(val->key, "artist")) {
							song->artist = val->value;
							artist = false;
						}
						else if (album && CompareStringIgnoreCase(val->key, "album")) {
							song->album = val->value;
							album = false;
						}
						else if (genre && CompareStringIgnoreCase(val->key, "genre")) {
							song->genre = val->value;
							genre = false;
						}
					}
				}
				double time_base = (double)aud_stream->time_base.num / (double)aud_stream->time_base.den;
				double duration = (double)aud_stream->duration * time_base * 1000.0;
				song->duration = ceil(duration);

				// if we didn't get title, try to get it from filename
				if (song->title.size() == 0) {
					std::experimental::filesystem::path path(filename);
					auto name = path.stem();
					song->title = name.string();
				}

				rtc = true;
			}
		}
		avformat_close_input(&ctx_format);
		avformat_free_context(ctx_format);
	}

	return rtc;
}

bool AudioInspector::CompareStringIgnoreCase(const char* string1, const char* string2) {
	if (string1 && string2) {
		while (*string1 != '\0' && *string2 != '\0') {
			if (tolower(*string1) != tolower(*string2)) {
				return false;
			}
			++string1; ++string2;
		}
		return (*string1 == '\0' && *string2 == '\0');
	}
	return false;
}
