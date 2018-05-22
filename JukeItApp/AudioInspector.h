#ifndef JUKEITAPP_AUDIOINSPECTOR_H_
#define JUKEITAPP_AUDIOINSPECTOR_H_

#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <experimental/filesystem>

extern "C" {
#include "ffmpeg/include/libavcodec/avcodec.h"
#include "ffmpeg/include/libavutil/frame.h"
#include "ffmpeg/include/libavutil/mem.h"
#include "ffmpeg/include/libavformat/avformat.h"
}

typedef struct {
	std::string title;
	std::string artist;
	std::string album;
	std::string genre;
	int duration;
} SongMetadata;

class AudioInspector {
public:
	AudioInspector();
	//~AudioInspector();

	bool GetMetadata(const char * filename, SongMetadata *song);
private:
	bool CompareStringIgnoreCase(const char* string1, const char* string2);	
};
#endif
