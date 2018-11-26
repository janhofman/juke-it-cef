#include "MusicPlayer.h"

namespace MusicPlayer {

	void Test(MusicPlayer *player) {
		std::string path = "H:\\Music\\Linkin Park\\Linkin Park-Hybrid Theory(Darkside_RG)\\08_-In_The_End.mp3";
		player->Open(path);
		player->Play();
		Pa_Sleep(10000);
		player->Pause();
		Pa_Sleep(5000);
		player->Play();
		Pa_Sleep(10000);
		player->Pause();
		player->Close();
	}

	MusicPlayer::MusicPlayer() {
		// register all codecs
		av_register_all();

		// initialize PortAudio
		PaError err = Pa_Initialize();
		if (err != paNoError) {
			fprintf(stderr, "Error: Portaudio not initialized.\n");
			fprintf(stderr, Pa_GetErrorText(err));
		}
	}

	MusicPlayer::~MusicPlayer() {
		Pa_Terminate();
	}

	static int Decode(StreamInfo *streamInfo, uint8_t *outbuffer, uint8_t ** bufferEnd, size_t nSamples/*, FILE *f*/)
	{
		int i, ch;
		int ret, data_size;
		int rtc = 0;
		uint8_t *out = outbuffer;
		// resolve our data size
		data_size = av_get_bytes_per_sample(streamInfo->ctx_codec->sample_fmt);
		if (data_size < 0) {
			/* This should not occur, checking just for paranoia */
			fprintf(stderr, "Failed to calculate data size\n");
			return 0;
		}

		// first write remaining samples from last loaded frame
		if (streamInfo->pkt->size && streamInfo->nextDataIndex < streamInfo->frame->nb_samples) {
			for (i = streamInfo->nextDataIndex; i < streamInfo->frame->nb_samples && rtc < nSamples; i++) {
				for (ch = 0; ch < streamInfo->ctx_codec->channels; ch++) {
					//fwrite(streamInfo->frame->data[ch] + data_size*i, 1, data_size, f);
					memcpy(out, streamInfo->frame->data[ch] + data_size * i, data_size);
					// move pointer
					out += data_size;
				}
				rtc++;
			}
			// mark where we ended
			streamInfo->nextDataIndex = i;
		}
		// continue decoding until we write enough data
		while (rtc < nSamples) {
			ret = avcodec_receive_frame(streamInfo->ctx_codec, streamInfo->frame);
			if (ret == AVERROR(EAGAIN)) {
				// we need to read another packet
				ret = av_read_frame(streamInfo->ctx_format, streamInfo->pkt);
				if (ret < 0) {
					// end of file
					if (streamInfo->playbackFinished) {
						streamInfo->playbackFinished();
					}
					break;
				}
				ret = avcodec_send_packet(streamInfo->ctx_codec, streamInfo->pkt);
				ret = avcodec_receive_frame(streamInfo->ctx_codec, streamInfo->frame);
				if (streamInfo->timeUpdate) {
					double time = streamInfo->frame->pts * av_q2d(streamInfo->ctx_format->streams[streamInfo->stream_idx]->time_base) * 1000.;
					int millis = (int)floor(time);
					if (millis - streamInfo->playbackTime > 500 || millis == 0) {
						streamInfo->timeUpdate(millis);
						streamInfo->playbackTime = millis;
					}
				}
			}
			else if (ret == AVERROR_EOF) {
				// we got to the end of file
				break;
			}
			for (i = 0; i < streamInfo->frame->nb_samples && rtc < nSamples; i++) {
				for (ch = 0; ch < streamInfo->ctx_codec->channels; ch++) {
					//fwrite(streamInfo->frame->data[ch] + data_size*i, 1, data_size, f);
					memcpy(out, streamInfo->frame->data[ch] + data_size * i, data_size);
					out += data_size;
				}
				rtc++;
			}
			// mark where we ended
			streamInfo->nextDataIndex = i;
		}
		*bufferEnd = out;
		// return number of processed frames
		return rtc;
	}

	static int PaCallback(const void *inputBuffer, void *outputBuffer,
		unsigned long framesCount,
		const PaStreamCallbackTimeInfo* timeInfo,
		PaStreamCallbackFlags statusFlags,
		void *helpStruct)
	{
		StreamInfo *streamInfo = (StreamInfo*)helpStruct;
		uint8_t *out = (uint8_t*)outputBuffer;

		(void)timeInfo; /* Prevent unused variable warnings. */
		(void)statusFlags;
		(void)inputBuffer;

		/*if (streamInfo->timeUpdate) {
			int millis = (int)floor(timeInfo->currentTime * 1000);
			streamInfo->timeUpdate(millis);
		}*/

		int decodedFrames = Decode(streamInfo, out, &out, framesCount/*, streamInfo->f*/);
		if ((unsigned int)decodedFrames < framesCount) {
			// stream finished, zero out the remaining buffer
			/*auto ctx = streamInfo->ctx_codec;
			size_t dataSize = av_get_bytes_per_sample(ctx->sample_fmt);
			auto end = out + decodedFrames * dataSize;
			memset(end, 0, (framesCount - decodedFrames) * ctx->channels * dataSize);*/
			return paComplete;
		}

		return paContinue;
	}

	void MusicPlayer::Open(std::string& filename) {
		AVStream *aud_stream = NULL;
		PaStreamParameters outputParameters;
		PaError err;

		if (_streamInfo.status != StreamStatus::EMPTY) {
			Close();
		}

		if (int ret = avformat_open_input(&_streamInfo.ctx_format, filename.c_str(), nullptr, nullptr) != 0) {
			return;
		}
		if (avformat_find_stream_info(_streamInfo.ctx_format, nullptr) < 0) {
			return; // Couldn't find stream information
		}
		for (unsigned int i = 0; i < _streamInfo.ctx_format->nb_streams; i++) {
			if (_streamInfo.ctx_format->streams[i]->codecpar->codec_type == AVMEDIA_TYPE_AUDIO) {
				_streamInfo.stream_idx = i;
				aud_stream = _streamInfo.ctx_format->streams[i];
				break;
			}
		}
		if (aud_stream == nullptr) {
			return;
		}

		_streamInfo.codec = avcodec_find_decoder(aud_stream->codecpar->codec_id);
		if (!_streamInfo.codec) {
			return;
		}
		_streamInfo.ctx_codec = avcodec_alloc_context3(_streamInfo.codec);

		if (avcodec_parameters_to_context(_streamInfo.ctx_codec, aud_stream->codecpar) < 0)
			fprintf(stderr, "Codec not found\n");
		if (avcodec_open2(_streamInfo.ctx_codec, _streamInfo.codec, nullptr) < 0) {
			fprintf(stderr, "Codec not found\n");
			return;
		}

		outputParameters.device = Pa_GetDefaultOutputDevice();
		if (outputParameters.device == paNoDevice) {
			fprintf(stderr, "Error: No default output device.\n");
			return;
		}

		auto device = Pa_GetDeviceInfo(outputParameters.device);
		(void)device;
		outputParameters.channelCount = aud_stream->codecpar->channels;
		outputParameters.sampleFormat = GetSampleFormat((AVSampleFormat)aud_stream->codecpar->format); // we always use uint8_t
		outputParameters.suggestedLatency = device->defaultHighOutputLatency;
		outputParameters.hostApiSpecificStreamInfo = NULL;

		/*_streamInfo.f = fopen("output.pcm", "wb");
		if (!_streamInfo.f) {
		fprintf(stderr, "codec not found\n");
		return;
		}*/

		err = Pa_OpenStream(
			&_streamInfo.stream,
			NULL, // no input
			&outputParameters,
			aud_stream->codecpar->sample_rate,
			0, // let PortAudio choose
			paNoFlag,      // we won't output out of range samples so don't bother clipping them
			PaCallback,
			&_streamInfo);
		if (err != paNoError) {
			fprintf(stderr, "Error: Stream wasn't opened.\n");
			fprintf(stderr, Pa_GetErrorText(err));
			return;
		}

		_streamInfo.pkt = av_packet_alloc();
		_streamInfo.frame = av_frame_alloc();

		_streamInfo.status = StreamStatus::OPEN;
	}

	void MusicPlayer::Play()
	{
		if (_streamInfo.status == StreamStatus::OPEN || _streamInfo.status == StreamStatus::PAUSED) {
			// start the stream
			PaError err = Pa_StartStream(_streamInfo.stream);
			if (err != paNoError) {
				fprintf(stderr, "Error: Stream couldn't start.\n");
				fprintf(stderr, Pa_GetErrorText(err));
				return;
			}
			_streamInfo.status = StreamStatus::PLAYING;
		}
	}

	void MusicPlayer::Pause()
	{
		if (_streamInfo.status == StreamStatus::PLAYING) {
			PaError err = Pa_StopStream(_streamInfo.stream);
			if (err != paNoError) {
				fprintf(stderr, "Error: Stream couldn't be stopped.\n");
				printf(Pa_GetErrorText(err));
				return;
			}
			_streamInfo.status = StreamStatus::PAUSED;
		}
	}

	void MusicPlayer::Close() {
		if (_streamInfo.status == StreamStatus::PLAYING) {
			Pause();
		}
		if (_streamInfo.status == StreamStatus::PAUSED || _streamInfo.status == StreamStatus::OPEN) {
			CleanStreamInfo();
		}
	}

	void MusicPlayer::SetTimeUpdateCallback(std::function<void(int)> callback)
	{
		_streamInfo.timeUpdate = callback;
	}

	void MusicPlayer::SetPlaybackFinishedCallback(std::function<void(void)> callback)
	{
		_streamInfo.playbackFinished = callback;
	}


	void MusicPlayer::CleanStreamInfo() {
		avformat_close_input(&_streamInfo.ctx_format);
		av_packet_free(&_streamInfo.pkt);
		av_frame_free(&_streamInfo.frame);
		avcodec_free_context(&_streamInfo.ctx_codec);
		avformat_free_context(_streamInfo.ctx_format);

		_streamInfo.stream_idx = 0;
		_streamInfo.nextDataIndex = 0;
		_streamInfo.status = StreamStatus::EMPTY;
		_streamInfo.playbackTime = 0;

		PaError err = Pa_CloseStream(_streamInfo.stream);
		if (err != paNoError) {
			fprintf(stderr, "Error: Stream wasn't closed.\n");
			fprintf(stderr, Pa_GetErrorText(err));
			return;
		}
		_streamInfo.stream = NULL;
	}

	PaSampleFormat MusicPlayer::GetSampleFormat(AVSampleFormat format) {
		switch (format)
		{
		case AV_SAMPLE_FMT_U8:
		case AV_SAMPLE_FMT_U8P:
			return paUInt8;
		case AV_SAMPLE_FMT_S16:
		case AV_SAMPLE_FMT_S16P:
			return paInt16;
		case AV_SAMPLE_FMT_S32:
		case AV_SAMPLE_FMT_S32P:
			return paInt32;
		case AV_SAMPLE_FMT_FLT:
		case AV_SAMPLE_FMT_FLTP:
			return paFloat32;
		default:
			return 0;
		}
	}

	static int Decode2(paUserData2 *userData, uint8_t *outbuffer, uint8_t ** bufferEnd, size_t nSamples, FILE *f)
	{
		int i, ch;
		int ret, data_size;
		int rtc = 0;
		uint8_t *out = outbuffer;

		data_size = av_get_bytes_per_sample(userData->ctx_codec->sample_fmt);
		if (data_size < 0) {
			/* This should not occur, checking just for paranoia */
			fprintf(stderr, "Failed to calculate data size\n");
			exit(1);
		}

		// first write remaining samples from last loaded frame
		if (userData->pkt->size && userData->nextDataIndex < userData->frame->nb_samples) {
			for (i = userData->nextDataIndex; i < userData->frame->nb_samples && rtc < nSamples; i++) {
				for (ch = 0; ch < userData->ctx_codec->channels; ch++) {
					fwrite(userData->frame->data[ch] + data_size * i, 1, data_size, f);
					memcpy(out, userData->frame->data[ch] + data_size * i, data_size);
					out += data_size;
				}
				rtc++;
			}
			userData->nextDataIndex = i;
			if (i >= userData->frame->nb_samples) {
				av_packet_unref(userData->pkt);
			}
		}

		if (rtc < nSamples) {
			while (rtc < nSamples) {
				ret = avcodec_receive_frame(userData->ctx_codec, userData->frame);
				if (ret == AVERROR(EAGAIN)) {
					// read another packet
					av_read_frame(userData->ctx_format, userData->pkt);
					ret = avcodec_send_packet(userData->ctx_codec, userData->pkt);
					ret = avcodec_receive_frame(userData->ctx_codec, userData->frame);
				}
				else if (ret == AVERROR_EOF) {
					break;
				}
				for (i = 0; i < userData->frame->nb_samples && rtc < nSamples; i++) {
					for (ch = 0; ch < userData->ctx_codec->channels; ch++) {
						fwrite(userData->frame->data[ch] + data_size * i, 1, data_size, f);
						memcpy(out, userData->frame->data[ch] + data_size * i, data_size);
						out += data_size;
					}
					rtc++;
				}
				userData->nextDataIndex = i;
			}
		}
		//while (av_read_frame(userData->ctx_format, userData->pkt) >= 0 && rtc < nSamples) {
		//	/* send the packet with the compressed data to the decoder */
		//	ret = avcodec_send_packet(userData->ctx_codec, userData->pkt);
		//	if (ret < 0) {
		//		fprintf(stderr, "Error submitting the packet to the decoder\n");
		//		exit(1);
		//	}

		//	/* read all the output frames (in general there may be any number of them */
		//	while (ret >= 0 && rtc < nSamples) {
		//		ret = avcodec_receive_frame(userData->ctx_codec, userData->frame);
		//		if (ret == AVERROR(EAGAIN) || ret == AVERROR_EOF)
		//			break;
		//		else if (ret < 0) {
		//			fprintf(stderr, "Error during decoding\n");
		//			exit(1);
		//		}
		//		for (i = 0; i < userData->frame->nb_samples && rtc < nSamples; i++) {
		//			for (ch = 0; ch < userData->ctx_codec->channels; ch++) {
		//				fwrite(userData->frame->data[ch] + data_size*i, 1, data_size, f);
		//				memcpy(out, userData->frame->data[ch] + data_size*i, data_size);
		//				out += data_size;
		//			}
		//			rtc++;
		//		}
		//		userData->nextDataIndex = i;
		//	}
		//}
	//}
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

		if ((unsigned int)Decode2(userData, out, &out, framesCount, userData->f) < framesCount - 1) {
			/*auto ctx = userData->ctx_codec;
			memset(out, 0, framesCount * ctx->channels * av_get_bytes_per_sample(ctx->sample_fmt));*/
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

		if (avcodec_parameters_to_context(userData.ctx_codec, aud_stream->codecpar) < 0)
			fprintf(stderr, "Codec not found\n");
		if (avcodec_open2(userData.ctx_codec, userData.codec, nullptr) < 0) {
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
		(void)device;
		outputParameters.channelCount = aud_stream->codecpar->channels;// userData.codec_ctx->channels;
		outputParameters.sampleFormat = paFloat32; // we always use uint8_t
		outputParameters.suggestedLatency = device->defaultHighOutputLatency;
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
					fwrite(frame->data[ch] + data_size * i, 1, data_size, outfile);
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

		if (avcodec_parameters_to_context(userData.ctx_codec, aud_stream->codecpar) < 0)
			fprintf(stderr, "Codec not found\n");
		if (avcodec_open2(userData.ctx_codec, userData.codec, nullptr) < 0) {
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
}
