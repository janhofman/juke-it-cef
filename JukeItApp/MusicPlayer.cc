#include "MusicPlayer.h"

static int Decode(AVCodecContext *dec_ctx, AVPacket *pkt, AVFrame *frame, uint8_t *outbuffer, uint8_t ** bufferEnd)
{
	int i, ch;
	int ret, data_size;
	int rtc = 0;

	/* send the packet with the compressed data to the decoder */
	ret = avcodec_send_packet(dec_ctx, pkt);
	if (ret < 0) {
		fprintf(stderr, "Error submitting the packet to the decoder\n");
		exit(1);
	}

	/* read all the output frames (in general there may be any number of them */
	while (ret >= 0) {
		ret = avcodec_receive_frame(dec_ctx, frame);
		if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
			break;
		else if (ret < 0) {
			fprintf(stderr, "Error during decoding\n");
			exit(1);
		}
		data_size = av_get_bytes_per_sample(dec_ctx->sample_fmt);
		if (data_size < 0) {
			/* This should not occur, checking just for paranoia */
			fprintf(stderr, "Failed to calculate data size\n");
			exit(1);
		}
		for (i = 0; i < frame->nb_samples; i++) {
			for (ch = 0; ch < dec_ctx->channels; ch++) {
				// fwrite(frame->data[ch] + data_size*i, 1, data_size, outfile);
				memcpy(outbuffer, frame->data[ch] + data_size*i, data_size);
				outbuffer += data_size;
			}
		}
		rtc++;
	}
	*bufferEnd = outbuffer;
	// return number of processed frames
	return rtc;
}

static int PaCallback(const void *inputBuffer, void *outputBuffer,
	unsigned long framesCount,
	const PaStreamCallbackTimeInfo* timeInfo,
	PaStreamCallbackFlags statusFlags,
	void *userData)
{
	paUserData *helpStruct = (paUserData*)userData;
	uint8_t *out = (uint8_t*)outputBuffer;

	(void)timeInfo; /* Prevent unused variable warnings. */
	(void)statusFlags;
	(void)inputBuffer;

	while (helpStruct->data_size > 0 && framesCount > 0) {
		int ret = av_parser_parse2(helpStruct->parser,
			helpStruct->codec_ctx,
			&helpStruct->pkt->data,
			&helpStruct->pkt->size,
			helpStruct->data,
			(int)helpStruct->data_size,
			AV_NOPTS_VALUE,
			AV_NOPTS_VALUE,
			0);

		if (ret < 0) {
			fprintf(stderr, "Error while parsing\n");
			exit(1);
		}
		helpStruct->data += ret;
		helpStruct->data_size -= ret;

		int framesDecoded = 0;
		if (helpStruct->pkt->size) {
			framesDecoded = Decode(helpStruct->codec_ctx, helpStruct->pkt, helpStruct->decoded_frame, out, &out);
			framesCount -= framesDecoded;
		}			

		if (helpStruct->data_size < AUDIO_REFILL_THRESH) {
			memmove(helpStruct->inbuf, helpStruct->data, helpStruct->data_size);
			helpStruct->data = helpStruct->inbuf;
			size_t len = fread(helpStruct->data + helpStruct->data_size, 1, 
				AUDIO_INBUF_SIZE - helpStruct->data_size, helpStruct->f);
			if (len > 0)
				helpStruct->data_size += len;
		}
	}

	if (framesCount > 0 || helpStruct->data_size == 0) {
		auto ctx = helpStruct->codec_ctx;
		memset(out, 0, framesCount * ctx->channels * av_get_bytes_per_sample(ctx->sample_fmt));
		return paComplete;
	}

	return paContinue;
}

void MusicPlayer::Play(std::string filename)
{
	const AVCodec *codec;
	paUserData userData;
	PaStreamParameters outputParameters;
	PaStream *stream;
	PaError err;

	userData.pkt = av_packet_alloc();

	/* find the MPEG audio decoder */
	codec = avcodec_find_decoder(AV_CODEC_ID_MP3);
	if (!codec) {
		fprintf(stderr, "Codec not found\n");
		exit(1);
	}

	userData.parser = av_parser_init(codec->id);
	if (!userData.parser) {
		fprintf(stderr, "Parser not found\n");
		exit(1);
	}

	userData.codec_ctx = avcodec_alloc_context3(codec);
	if (!userData.codec_ctx) {
		fprintf(stderr, "Could not allocate audio codec context\n");
		exit(1);
	}

	/* open it */
	if (avcodec_open2(userData.codec_ctx, codec, NULL) < 0) {
		fprintf(stderr, "Could not open codec\n");
		exit(1);
	}

	userData.f = fopen(filename.c_str(), "rb");
	if (!userData.f) {
		fprintf(stderr, "Could not open %s\n", filename.c_str());
		exit(1);
	}

	// initialize PortAudio
	err = Pa_Initialize();
	if (err != paNoError) {
		fprintf(stderr, "Error: Portaudio not initialized.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}

	outputParameters.device = Pa_GetDefaultOutputDevice();
	if (outputParameters.device == paNoDevice) {
		fprintf(stderr, "Error: No default output device.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}
	outputParameters.channelCount = 2;// userData.codec_ctx->channels;
	outputParameters.sampleFormat = paUInt8; // we always use uint8_t
	outputParameters.suggestedLatency = Pa_GetDeviceInfo(outputParameters.device)->defaultLowOutputLatency;
	outputParameters.hostApiSpecificStreamInfo = NULL;

	err = Pa_OpenStream(
		&stream,
		NULL, // no input
		&outputParameters,
		44100,//userData.codec_ctx->sample_rate,
		0,
		paClipOff,      /* we won't output out of range samples so don't bother clipping them */
		PaCallback,
		&userData);
	if (err != paNoError) {
		fprintf(stderr, "Error: Stream wasn't opened.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}
	
	// load initial data to input buffer
	userData.data = userData.inbuf;
	userData.data_size = fread(userData.inbuf, 1, AUDIO_INBUF_SIZE, userData.f);
	// allocate frame because allocating in callback is forbidden
	if (!userData.decoded_frame) {
		userData.decoded_frame = av_frame_alloc();
		if (!userData.decoded_frame) {
			fprintf(stderr, "Could not allocate audio frame\n");
			exit(1);
		}
	}

	// start the stream
	err = Pa_StartStream(stream);
	if (err != paNoError) {
		fprintf(stderr, "Error: Stream couldn't start.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}
	
	Pa_Sleep(10000);
	
	err = Pa_StopStream(stream);
	if (err != paNoError) {
		fprintf(stderr, "Error: Stream couldn't be stopped.\n");
		printf(Pa_GetErrorText(err));
		return;
	}

	/* flush the decoder */
	/*pkt->data = NULL;
	pkt->size = 0;
	decode(c, pkt, decoded_frame, outfile);*/

	fclose(userData.f);

	avcodec_free_context(&userData.codec_ctx);
	av_parser_close(userData.parser);
	av_frame_free(&userData.decoded_frame);
	av_packet_free(&userData.pkt);

	err = Pa_CloseStream(stream);
	if (err != paNoError) {
		fprintf(stderr, "Error: Stream wasn't closed.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}

	Pa_Terminate();
	printf("Test finished.\n");

	return;
}

static int Decode2(AVCodecContext *dec_ctx, AVPacket *pkt, AVFrame *frame, uint8_t *outbuffer, uint8_t ** bufferEnd, FILE *f)
{
	int i, ch;
	int ret, data_size;
	int rtc = 0;
	uint8_t *out = outbuffer;

	/* send the packet with the compressed data to the decoder */
	ret = avcodec_send_packet(dec_ctx, pkt);
	if (ret < 0) {
		fprintf(stderr, "Error submitting the packet to the decoder\n");
		exit(1);
	}

	/* read all the output frames (in general there may be any number of them */
	while (ret >= 0) {
		ret = avcodec_receive_frame(dec_ctx, frame);
		if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
			break;
		else if (ret < 0) {
			fprintf(stderr, "Error during decoding\n");
			exit(1);
		}
		data_size = av_get_bytes_per_sample(dec_ctx->sample_fmt);
		if (data_size < 0) {
			/* This should not occur, checking just for paranoia */
			fprintf(stderr, "Failed to calculate data size\n");
			exit(1);
		}
		for (i = 0; i < frame->nb_samples; i++) {
			for (ch = 0; ch < dec_ctx->channels; ch++) {
				fwrite(frame->data[ch] + data_size*i, 1, data_size, f);
				memcpy(out, frame->data[ch] + data_size*i, data_size);
				out += data_size;
			}
		}
		rtc++;
	}
	*bufferEnd = out;
	// return number of processed frames
	return rtc;
}

static int PaCallback2(const void *inputBuffer, void *outputBuffer,
	unsigned long framesCount,
	const PaStreamCallbackTimeInfo* timeInfo,
	PaStreamCallbackFlags statusFlags,
	void *helpStruct)
{
	paUserData2 *userData = (paUserData2*)helpStruct;
	uint8_t *out = (uint8_t*)outputBuffer;
	uint8_t *pDebug = out;
	size_t diff = 0;

	(void)diff;
	(void)pDebug;
	(void)timeInfo; /* Prevent unused variable warnings. */
	(void)statusFlags;
	(void)inputBuffer;

	while (av_read_frame(userData->ctx_format, userData->pkt) >= 0 && framesCount > 0) {		
		int framesDecoded = Decode2(userData->ctx_codec, userData->pkt, userData->frame, out, &out, userData->f);
		framesCount -= framesDecoded;
		diff = out - pDebug;

		av_packet_unref(userData->pkt);
		return paContinue;
	}

	if (framesCount > 0 || av_read_frame(userData->ctx_format, userData->pkt) < 0) {
		auto ctx = userData->ctx_codec;
		memset(out, 0, framesCount * ctx->channels * av_get_bytes_per_sample(ctx->sample_fmt));
		return paComplete;
	}

	return paContinue;
}

void MusicPlayer::Play2(std::string filename) {	
	AVStream *aud_stream = NULL;
	PaStreamParameters outputParameters;
	PaStream *stream;
	PaError err;
	paUserData2 userData;
	userData.frame = av_frame_alloc();
	userData.pkt = av_packet_alloc();

	av_register_all();

	if (int ret = avformat_open_input(&userData.ctx_format, filename.c_str(), nullptr, nullptr) != 0) {
		return;
	}
	if (avformat_find_stream_info(userData.ctx_format, nullptr) < 0) {
		return; // Couldn't find stream information
	}
	av_dump_format(userData.ctx_format, 0, filename.c_str(), false);

	for (unsigned int i = 0; i < userData.ctx_format->nb_streams; i++)
		if (userData.ctx_format->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_AUDIO) {
			userData.stream_idx = i;
			aud_stream = userData.ctx_format->streams[i];
			break;
		}
	if (aud_stream == nullptr) {
		return;
	}

	userData.codec = avcodec_find_decoder(aud_stream->codecpar->codec_id);
	if (!userData.codec) {
		fprintf(stderr, "codec not found\n");
		exit(1);
	}
	userData.ctx_codec = avcodec_alloc_context3(userData.codec);

	if (avcodec_parameters_to_context(userData.ctx_codec, aud_stream->codecpar)<0)
		fprintf(stderr, "Codec not found\n");
	if (avcodec_open2(userData.ctx_codec, userData.codec, nullptr)<0) {
		fprintf(stderr, "Codec not found\n");
		return;
	}	

	// initialize PortAudio
	err = Pa_Initialize();
	if (err != paNoError) {
		fprintf(stderr, "Error: Portaudio not initialized.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}

	outputParameters.device = Pa_GetDefaultOutputDevice();
	if (outputParameters.device == paNoDevice) {
		fprintf(stderr, "Error: No default output device.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}

	auto device = Pa_GetDeviceInfo(outputParameters.device);

	outputParameters.channelCount = aud_stream->codecpar->channels;// userData.codec_ctx->channels;
	outputParameters.sampleFormat = paFloat32; // we always use uint8_t
	outputParameters.suggestedLatency = device->defaultHighInputLatency;
	outputParameters.hostApiSpecificStreamInfo = NULL;

	userData.f = fopen("output.pcm", "wb");
	if (!userData.f) {
		fprintf(stderr, "codec not found\n");
		return;
	}

	err = Pa_OpenStream(
		&stream,
		NULL, // no input
		&outputParameters,
		aud_stream->codecpar->sample_rate,//44100,//userData.codec_ctx->sample_rate,
		0,
		paNoFlag,      /* we won't output out of range samples so don't bother clipping them */
		PaCallback2,
		&userData);
	if (err != paNoError) {
		fprintf(stderr, "Error: Stream wasn't opened.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}

	// start the stream
	err = Pa_StartStream(stream);
	if (err != paNoError) {
		fprintf(stderr, "Error: Stream couldn't start.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}

	Pa_Sleep(100000);	

	err = Pa_StopStream(stream);
	if (err != paNoError) {
		fprintf(stderr, "Error: Stream couldn't be stopped.\n");
		printf(Pa_GetErrorText(err));
		return;
	}

	fclose(userData.f);

	/* flush the decoder */
	/*pkt->data = NULL;
	pkt->size = 0;
	decode(c, pkt, decoded_frame, outfile);*/

	avformat_close_input(&userData.ctx_format);
	av_packet_unref(userData.pkt);
	avcodec_free_context(&userData.ctx_codec);
	avformat_free_context(userData.ctx_format);

	err = Pa_CloseStream(stream);
	if (err != paNoError) {
		fprintf(stderr, "Error: Stream wasn't closed.\n");
		fprintf(stderr, Pa_GetErrorText(err));
		return;
	}

	Pa_Terminate();
	printf("Test finished.\n");

	return;
}

static void decode(AVCodecContext *dec_ctx, AVPacket *pkt, AVFrame *frame,
	FILE *outfile)
{
	int i, ch;
	int ret, data_size;

	/* send the packet with the compressed data to the decoder */
	ret = avcodec_send_packet(dec_ctx, pkt);	
	if (ret < 0) {
		char error[1000];
		av_strerror(ret, error, 1000);
		switch (ret)
		{
		case AVERROR(EAGAIN):
			fprintf(stderr, "Error EAGAIN submitting the packet to the decoder\n");
			break;
		case AVERROR(EINVAL):
			fprintf(stderr, "Error EINVAL submitting the packet to the decoder\n");
			break;
		case AVERROR(ENOMEM):
			fprintf(stderr, "Error ENOMEM submitting the packet to the decoder\n");
			break;
		case AVERROR_EOF:
			fprintf(stderr, "Error EOF submitting the packet to the decoder\n");
			break;
		default:
			fprintf(stderr, "Error default submitting the packet to the decoder\n");
			break;
		}
		exit(1);
	}

	/* read all the output frames (in general there may be any number of them */
	while (ret >= 0) {
		ret = avcodec_receive_frame(dec_ctx, frame);
		if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
			return;
		else if (ret < 0) {
			fprintf(stderr, "Error during decoding\n");
			exit(1);
		}
		data_size = av_get_bytes_per_sample(dec_ctx->sample_fmt);
		if (data_size < 0) {
			/* This should not occur, checking just for paranoia */
			fprintf(stderr, "Failed to calculate data size\n");
			exit(1);
		}
		for (i = 0; i < frame->nb_samples; i++)
			for (ch = 0; ch < dec_ctx->channels; ch++)
				fwrite(frame->data[ch] + data_size*i, 1, data_size, outfile);
	}
}

int DecodeFile(std::string input, std::string output)
{	
	AVStream *aud_stream = NULL;
	paUserData2 userData;
	userData.frame = av_frame_alloc();
	userData.pkt = av_packet_alloc();

	av_register_all();

	if (int ret = avformat_open_input(&userData.ctx_format, input.c_str(), nullptr, nullptr) != 0) {
		return -1;
	}
	if (avformat_find_stream_info(userData.ctx_format, nullptr) < 0) {
		return -1; // Couldn't find stream information
	}
	av_dump_format(userData.ctx_format, 0, input.c_str(), false);

	for (unsigned int i = 0; i < userData.ctx_format->nb_streams; i++)
		if (userData.ctx_format->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_AUDIO) {
			userData.stream_idx = i;
			aud_stream = userData.ctx_format->streams[i];
			break;
		}
	if (aud_stream == nullptr) {
		return -1;
	}

	userData.codec = avcodec_find_decoder(aud_stream->codecpar->codec_id);
	if (!userData.codec) {
		fprintf(stderr, "codec not found\n");
		exit(1);
	}
	userData.ctx_codec = avcodec_alloc_context3(userData.codec);

	if (avcodec_parameters_to_context(userData.ctx_codec, aud_stream->codecpar)<0)
		fprintf(stderr, "Codec not found\n");
	if (avcodec_open2(userData.ctx_codec, userData.codec, nullptr)<0) {
		fprintf(stderr, "Codec not found\n");
		return -1;
	}

	FILE *outfile = fopen(output.c_str(), "wb");
	if (!outfile) {
		fprintf(stderr, "codec not found\n");
		return -1;
	}

	while (av_read_frame(userData.ctx_format, userData.pkt) >= 0) {
		decode(userData.ctx_codec, userData.pkt, userData.frame, outfile);
	}

	userData.pkt->data = NULL;
	userData.pkt->size = 0;
	decode(userData.ctx_codec, userData.pkt, userData.frame, outfile);

	fclose(outfile);

	avformat_close_input(&userData.ctx_format);
	av_packet_unref(userData.pkt);
	avcodec_free_context(&userData.ctx_codec);
	avformat_free_context(userData.ctx_format);

	printf("Test finished.\n");

	return -1;
}
