#include "MusicPlayer.h"

namespace MusicPlayer {

	namespace {

		int readFunction(void* opaque, uint8_t* buf, int buf_size)
		{
			std::basic_istream<std::uint8_t>* stream = (std::basic_istream<std::uint8_t>*)opaque;
			stream->read(buf, buf_size);
			if (stream->eof()) {
				// if we accidentally read past the end of stream, reset error to be able to use stream again
				stream->clear();
			}
			return stream->gcount();
		}

		int64_t seekFunction(void* opaque, int64_t offset, int whence)
		{
			std::basic_istream<std::uint8_t>* stream = (std::basic_istream<std::uint8_t>*)opaque;

			if (whence == AVSEEK_SIZE) {
				auto pos = stream->tellg();
				stream->seekg(0, stream->end);
				auto end = stream->tellg();
				stream->seekg(0, stream->beg);
				auto beg = stream->tellg();
				stream->seekg(pos, stream->beg);
				return end - beg;
			}
			else if (whence == SEEK_END) {
				stream->seekg(0, stream->end);
			}
			else if (whence == SEEK_SET) {
				stream->seekg(offset, stream->beg);
			}
			else if (whence == SEEK_CUR) {
				stream->seekg(offset, stream->beg);
			}
			else {
				return -1;
			}

			return stream->tellg();
		}

		static void ApplyVolume(const StreamInfo *streamInfo, uint8_t *sampleBuffer) {
			switch (streamInfo->sampleFormat)
			{
			case paUInt8: {
				std::uint8_t sample = *sampleBuffer;
				sample = (std::uint8_t)(sample*streamInfo->volume);
				*sampleBuffer = sample;
				break;
			}
			case paInt16: {
				std::int16_t sample = *((std::int16_t*)sampleBuffer);
				sample = (std::int16_t)(sample*streamInfo->volume);
				*((std::int16_t*)sampleBuffer) = sample;
				break;
			}
			case paInt32: {
				std::int32_t sample = *((std::int32_t*)sampleBuffer);
				sample = (std::int32_t)(sample*streamInfo->volume);
				*((std::int32_t*)sampleBuffer) = sample;
				break;
			}
			case paFloat32: {
				std::float_t sample = *((std::float_t*)sampleBuffer);
				sample = (std::float_t)(sample*streamInfo->volume);
				*((std::float_t*)sampleBuffer) = sample;
				break;
			}
			default:
				break;
			}
		}

		static int Decode(StreamInfo *streamInfo, uint8_t *outbuffer, uint8_t ** bufferEnd, size_t nSamples/*, FILE *f*/)
		{
			int i, ch;
			int ret, data_size;
			size_t rtc = 0;
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
				if (av_sample_fmt_is_planar(streamInfo->ctx_codec->sample_fmt)) {
					// planar audio

					for (i = streamInfo->nextDataIndex; i < streamInfo->frame->nb_samples && rtc < nSamples; i++) {
						for (ch = 0; ch < streamInfo->ctx_codec->channels; ch++) {
							std::uint8_t sampleBuffer[4];
							memcpy(sampleBuffer, streamInfo->frame->data[ch] + data_size * i, data_size);
							ApplyVolume(streamInfo, sampleBuffer);
							memcpy(out, sampleBuffer, data_size);
							out += data_size;
						}
						rtc++;
					}
					// mark where we ended
					streamInfo->nextDataIndex = i;
				}
				else {
					// non-planar audio
					for (i = streamInfo->nextDataIndex; i < streamInfo->frame->nb_samples && rtc < nSamples; i++) {
						for (ch = 0; ch < streamInfo->ctx_codec->channels; ch++) {							
							std::uint8_t sampleBuffer[4];
							memcpy(sampleBuffer, streamInfo->frame->data[0] + data_size * i * streamInfo->ctx_codec->channels + data_size * ch, data_size);
							ApplyVolume(streamInfo, sampleBuffer);
							memcpy(out, sampleBuffer, data_size);
							out += data_size;
						}
						rtc++;
					}
					// mark where we ended
					streamInfo->nextDataIndex = i;
				}
			}
			// continue decoding until we write enough data
			while (rtc < nSamples) {
				ret = avcodec_receive_frame(streamInfo->ctx_codec, streamInfo->frame);
				while (ret == AVERROR(EAGAIN)) {
					if (streamInfo->pkt != NULL) {
						av_packet_unref(streamInfo->pkt);
					}
					// we need to read another packet
					ret = av_read_frame(streamInfo->ctx_format, streamInfo->pkt);
					if (ret < 0) {
						char err[AV_ERROR_MAX_STRING_SIZE];
						av_strerror(ret, err, AV_ERROR_MAX_STRING_SIZE);
						// end of file
						if (streamInfo->playbackFinished) {
							streamInfo->playbackFinished();
						}
						break;
					}
					ret = avcodec_send_packet(streamInfo->ctx_codec, streamInfo->pkt);
					ret = avcodec_receive_frame(streamInfo->ctx_codec, streamInfo->frame);
					if (streamInfo->statusCallback) {
						double time = streamInfo->frame->pts * av_q2d(streamInfo->ctx_format->streams[streamInfo->stream_idx]->time_base) * 1000.;
						int millis = (int)floor(time);
						if (millis - streamInfo->playbackTime > 500 || millis == 0) {
							streamInfo->statusCallback(streamInfo->status == StreamStatus::PLAYING, millis);
							streamInfo->playbackTime = millis;
						}
					}
				}

				if (ret == AVERROR_EOF) {
					// we got to the end of file
					break;
				}

				if (av_sample_fmt_is_planar(streamInfo->ctx_codec->sample_fmt)) {
					// planar audio

					for (i = 0; i < streamInfo->frame->nb_samples && rtc < nSamples; i++) {
						for (ch = 0; ch < streamInfo->ctx_codec->channels; ch++) {
							////fwrite(streamInfo->frame->data[ch] + data_size*i, 1, data_size, f);
							//memcpy(out, streamInfo->frame->data[ch] + data_size * i, data_size);
							//out += data_size;
							std::uint8_t sampleBuffer[4];
							memcpy(sampleBuffer, streamInfo->frame->data[ch] + data_size * i, data_size);
							ApplyVolume(streamInfo, sampleBuffer);
							memcpy(out, sampleBuffer, data_size);
							out += data_size;
						}
						rtc++;
					}
					// mark where we ended
					streamInfo->nextDataIndex = i;
				}
				else {
					// non-planar audio
					for (i = 0; i < streamInfo->frame->nb_samples && rtc < nSamples; i++) {
						for (ch = 0; ch < streamInfo->ctx_codec->channels; ch++) {
							////fwrite(streamInfo->frame->data[ch] + data_size*i, 1, data_size, f);
							//memcpy(out, streamInfo->frame->data[ch] + data_size * i, data_size);
							//out += data_size;
							std::uint8_t sampleBuffer[4];
							memcpy(sampleBuffer, streamInfo->frame->data[0] + data_size * i * streamInfo->ctx_codec->channels + data_size * ch, data_size);
							ApplyVolume(streamInfo, sampleBuffer);
							memcpy(out, sampleBuffer, data_size);
							out += data_size;
						}
						rtc++;
					}
					// mark where we ended
					streamInfo->nextDataIndex = i;
				}
			}
			*bufferEnd = out;
			// return number of processed frames
			return (int)rtc;
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
	} // namespace

	MusicPlayer::MusicPlayer() {
		// register all codecs
		av_register_all();
		avcodec_register_all();

		// initialize PortAudio
		PaError err = Pa_Initialize();
		if (err != paNoError) {
			fprintf(stderr, "Error: Portaudio not initialized.\n");
			fprintf(stderr, Pa_GetErrorText(err));
		}
	}

	MusicPlayer::~MusicPlayer() {
		if (_streamInfo.status != StreamStatus::EMPTY) {
			Close();
		}
		Pa_Terminate();
	}	

	void MusicPlayer::Open(std::string& filename) {
		AVStream *aud_stream = NULL;
		PaStreamParameters outputParameters;
		PaError err;

		if (_streamInfo.status != StreamStatus::EMPTY) {
			Close();
		}

		if (avformat_open_input(&_streamInfo.ctx_format, filename.c_str(), nullptr, nullptr) != 0) {
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

			if (_streamInfo.statusCallback) {
				_streamInfo.statusCallback(_streamInfo.status == StreamStatus::PLAYING, _streamInfo.playbackTime);
			}
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

			if (_streamInfo.statusCallback) {
				_streamInfo.statusCallback(_streamInfo.status == StreamStatus::PLAYING, _streamInfo.playbackTime);
			}
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

	void MusicPlayer::SetStatusCallback(std::function<void(bool, int)> callback)
	{
		_streamInfo.statusCallback = callback;
	}

	void MusicPlayer::SetPlaybackFinishedCallback(std::function<void(void)> callback)
	{
		_streamInfo.playbackFinished = callback;
	}

	void MusicPlayer::SetVolume(std::int32_t volume) {
		if (volume >= 0 && volume <= 100) {
			_streamInfo.volume = volume / 100.;
		}
	}

	void MusicPlayer::CleanStreamInfo() {
		avformat_close_input(&_streamInfo.ctx_format);
		av_packet_free(&_streamInfo.pkt);
		av_frame_free(&_streamInfo.frame);
		avcodec_free_context(&_streamInfo.ctx_codec);
		if (_streamInfo.io_context != NULL) {
			// clean buffer first
			av_free(&_streamInfo.io_context->buffer);
			avio_context_free(&_streamInfo.io_context);
		}
		avformat_free_context(_streamInfo.ctx_format);

		_streamInfo.stream_idx = 0;
		_streamInfo.nextDataIndex = 0;
		_streamInfo.status = StreamStatus::EMPTY;
		_streamInfo.playbackTime = 0;
		_streamInfo.duration = 0;
		_streamInfo.sampleFormat = 0;

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

	void MusicPlayer::Open(const std::basic_istream<std::uint8_t>& is) {
		AVStream *aud_stream = NULL;
		PaStreamParameters outputParameters;
		PaError err;

		if (_streamInfo.status != StreamStatus::EMPTY) {
			Close();
		}

		const int ioBufferSize = 32768;
		unsigned char * ioBuffer = (unsigned char *)av_malloc(ioBufferSize + AV_INPUT_BUFFER_PADDING_SIZE); // can get av_free()ed by libav
		_streamInfo.io_context = avio_alloc_context(ioBuffer, ioBufferSize, 0, (void*)(&is), &readFunction, NULL, &seekFunction);
		_streamInfo.ctx_format = avformat_alloc_context();
		_streamInfo.ctx_format->pb = _streamInfo.io_context;
		_streamInfo.ctx_format->flags |= AVFMT_FLAG_CUSTOM_IO; // we supplied custom IO
		
		int rtc = 0;
		
		rtc = avformat_open_input(&_streamInfo.ctx_format, "dummyFileName", NULL, NULL);
		if (rtc < 0) {			
			char errstr[AV_ERROR_MAX_STRING_SIZE];
			av_strerror(rtc, errstr, AV_ERROR_MAX_STRING_SIZE);
			return;
		}

		rtc = avformat_find_stream_info(_streamInfo.ctx_format, nullptr);
		if (rtc < 0) {
			char errstr[AV_ERROR_MAX_STRING_SIZE];
			av_strerror(rtc, errstr, AV_ERROR_MAX_STRING_SIZE);
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

		auto duration = _streamInfo.ctx_format->streams[_streamInfo.stream_idx]->duration * av_q2d(_streamInfo.ctx_format->streams[_streamInfo.stream_idx]->time_base) * 1000.;
		_streamInfo.duration = (int)ceil(duration);

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

		_streamInfo.sampleFormat = outputParameters.sampleFormat;

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
}
