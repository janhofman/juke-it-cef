#ifndef JUKEITAPP_MUSICPLAYER_H_
#define JUKEITAPP_MUSICPLAYER_H_

#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <functional>

extern "C" {
#include "ffmpeg/include/libavcodec/avcodec.h"
#include "ffmpeg/include/libavutil/frame.h"
#include "ffmpeg/include/libavutil/mem.h"
#include "ffmpeg/include/libavformat/avformat.h"
#include "portaudio/include/portaudio.h"
}


#define AUDIO_INBUF_SIZE 20480
#define AUDIO_REFILL_THRESH 4096

typedef struct {
	AVCodecContext *codec_ctx = NULL;
	AVCodecParserContext *parser = NULL;
	FILE *f;
	uint8_t inbuf[AUDIO_INBUF_SIZE + AV_INPUT_BUFFER_PADDING_SIZE];
	uint8_t *data;
	size_t   data_size;
	AVPacket *pkt;
	AVFrame *decoded_frame = NULL;
} paUserData;

typedef struct {
	AVCodec *codec = NULL;
	AVFormatContext *ctx_format = NULL;
	AVCodecContext *ctx_codec = NULL;
	int stream_idx;
	AVPacket* pkt = NULL;
	AVFrame* frame = NULL;
	FILE * f;
	int nextDataIndex;
} paUserData2;

enum StreamStatus {
	OPEN,
	EMPTY,
	PLAYING,
	PAUSED
};

typedef struct {
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
	std::function<void(int)>timeUpdate = nullptr;
	std::function<void(void)>playbackFinished = nullptr;
	int playbackTime = 0;
} StreamInfo;

int DecodeFile(std::string input, std::string output);

class MusicPlayer {
public:
	MusicPlayer();
	~MusicPlayer();
	void Play();
	void Pause();
	void Open(std::string& filename);
	void Close();
	void SetTimeUpdateCallback(std::function<void(int)> callback);
	void SetPlaybackFinishedCallback(std::function<void(void)> callback);

	void Play2(std::string filename);
private:
	StreamInfo _streamInfo;
	PaSampleFormat GetSampleFormat(AVSampleFormat format);
	void CleanStreamInfo();
};

void Test(MusicPlayer *player);

#endif

