#ifndef JUKEITAPP_MUSICPLAYER_H_
#define JUKEITAPP_MUSICPLAYER_H_

#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <functional>
#include <vector>

#include "cpprestsdk/include/cpprest/containerstream.h"

extern "C" {
#include "ffmpeg/include/libavcodec/avcodec.h"
#include "ffmpeg/include/libavutil/frame.h"
#include "ffmpeg/include/libavutil/mem.h"
#include "ffmpeg/include/libavformat/avformat.h"
#include "portaudio/include/portaudio.h"
}

namespace MusicPlayer {

typedef Concurrency::streams::container_buffer<std::vector<uint8_t>> AsyncBuffer;

#define AUDIO_INBUF_SIZE 20480
#define AUDIO_REFILL_THRESH 4096

	enum StreamStatus {
		OPEN,
		EMPTY,
		PLAYING,
		PAUSED
	};

	typedef struct {
		AVIOContext * io_context = NULL;
		AVCodec *codec = NULL;
		AVFormatContext *ctx_format = NULL;
		AVCodecContext *ctx_codec = NULL;
		int stream_idx;
		AVPacket* pkt = NULL;
		AVFrame* frame = NULL;
		FILE * f;
		int nextDataIndex;
		StreamStatus status;
		PaStream *stream;
		std::function<void(bool, int)>statusCallback = nullptr; 
		std::function<void(void)>playbackFinished = nullptr;
		int playbackTime = 0;
		int duration = 0;
		double volume = 1;
		PaSampleFormat sampleFormat = 0;
	} StreamInfo;

	class MusicPlayer {
	public:
		MusicPlayer();
		~MusicPlayer();
		void Play();
		void Pause();
		void Close();
		void SetStatusCallback(std::function<void(bool, int)> callback); // (bool playing, int timestamp)
		void SetPlaybackFinishedCallback(std::function<void(void)> callback);
		void SetVolume(std::int32_t volume);
		void Open(const std::basic_istream<std::uint8_t>& is);
		[[deprecated("Open method should use std::basic_istream returned by SongCache")]]
		void Open(std::string& filename);
	private:
		StreamInfo _streamInfo;
		PaSampleFormat GetSampleFormat(AVSampleFormat format);
		void CleanStreamInfo();
	};	
}

#endif

