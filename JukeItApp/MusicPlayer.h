#ifndef JUKEITAPP_MUSICPLAYER_H_
#define JUKEITAPP_MUSICPLAYER_H_

#include <stdio.h>
#include <stdlib.h>
#include <string>

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
//
//static int PaCallback(const void *inputBuffer, void *outputBuffer,
//	unsigned long framesCount,
//	const PaStreamCallbackTimeInfo* timeInfo,
//	PaStreamCallbackFlags statusFlags,
//	void *userData);
//
//static int Decode(AVCodecContext *dec_ctx, AVPacket *pkt, AVFrame *frame, uint8_t *outbuffer);
int DecodeFile(std::string input, std::string output);
static void decode(AVCodecContext *dec_ctx, AVPacket *pkt, AVFrame *frame,
	FILE *outfile);

class MusicPlayer {
public:
	void Play(std::string filename);
	void Play2(std::string filename);
private:
};

#endif

