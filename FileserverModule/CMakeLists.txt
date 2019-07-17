#
# Source files.
#

# Fileserver module sources.
set (JUKEITAPP_FOLDER ${CMAKE_CURRENT_SOURCE_DIR}/../JukeItApp)
  
set(FILESERVER_SRCS
  main.cpp
  ${JUKEITAPP_FOLDER}/AudioInspector.h
  ${JUKEITAPP_FOLDER}/AudioInspector.cc
  ${JUKEITAPP_FOLDER}/FileServerHandler.h
  ${JUKEITAPP_FOLDER}/FileServerHandler.cc
  ${JUKEITAPP_FOLDER}/rest.h
  ${JUKEITAPP_FOLDER}/rest.cpp
  ${JUKEITAPP_FOLDER}/SqliteAPI.h
  ${JUKEITAPP_FOLDER}/SqliteAPI.cc
  ${JUKEITAPP_FOLDER}/tinyfiledialogs.h
  ${JUKEITAPP_FOLDER}/tinyfiledialogs.c
  )
  
source_group("Source files" FILES ${FILESERVER_SRCS})

# Target executable name.
set(TARGET "JukeIt FileServer")

# find Boost and include it
set(Boost_USE_STATIC_LIBS OFF) 
set(Boost_USE_MULTITHREADED ON)  
set(Boost_USE_STATIC_RUNTIME OFF) 
find_package(Boost 1.67.0) 

if(Boost_FOUND)
    include_directories(${Boost_INCLUDE_DIRS})   
    link_directories(${Boost_LIBRARY_DIRS})
endif()

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/..) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../JukeItApp)       
add_executable(${TARGET} WIN32 ${FILESERVER_SRCS})

set(TARGET_OUT_DIR "${CMAKE_CURRENT_BINARY_DIR}/$<CONFIGURATION>")

set(FFMPEG_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../ffmpeg/ffmpeg-4.0-win64-dev/lib)
set(FFMPEG_LIB_LOCATION 
    ${FFMPEG_DIR}/avcodec.lib
    ${FFMPEG_DIR}/avutil.lib
    ${FFMPEG_DIR}/avformat.lib
   )
   
set(CPPRESTSDK_FILES
  bcrypt.lib
  crypt32.lib
  winhttp.lib
  httpapi.lib
)
set(CPPRESTSDK_FILES_DEBUG
  ${CMAKE_CURRENT_SOURCE_DIR}/../cpprestsdk/Binaries/x64/Debug/libcpprest140d_2_10.lib
)
set(CPPRESTSDK_FILES_RELEASE
   ${CMAKE_CURRENT_SOURCE_DIR}/../cpprestsdk/Binaries/x64/Release/cpprest_2_10.lib
)

add_definitions(-D_NO_ASYNCRTIMP -D_NO_PPLXIMP)   

target_link_libraries(${TARGET} general ${CPPRESTSDK_FILES} debug ${CPPRESTSDK_FILES_DEBUG} optimized ${CPPRESTSDK_FILES_RELEASE} ${FFMPEG_LIB_LOCATION} sqlite3)

set(FFMPEG_BINARY_FILES
  avcodec-58.dll   
  avutil-56.dll
  avformat-58.dll       
  swresample-3.dll
)

# Copy binary and resource files to the target output directory.
  COPY_FILES("${TARGET}" "${FFMPEG_BINARY_FILES}" "${CMAKE_CURRENT_SOURCE_DIR}/../ffmpeg/ffmpeg-4.0-win64-dev/bin" "${TARGET_OUT_DIR}")
  
if(OS_WINDOWS)    
  set(PLAYER_COMPILER_FLAGS_DEBUG
    /MTd          # Multithreaded debug runtime  
    /RTC1         # Disable optimizations
    /Od           # Enable basic run-time checks   
    -O0                             # Disable optimizations
    -g                              # Generate debug information
    )
  set(PLAYER_COMPILER_FLAGS_RELEASE       
    /MT           # Multithreaded release runtime
    /O2           # Optimize for maximum speed
    /Ob2          # Inline any suitable function
    /GF           # Enable string pooling
    )
  set(PLAYER_LINKER_FLAGS_DEBUG
    /DEBUG        # Generate debug information
    )
  set(PLAYER_COMPILER_DEFINES
    UNICODE _UNICODE                  # Unicode build
    WINVER=0x0601 _WIN32_WINNT=0x601  # Targeting Windows 7
    _HAS_EXCEPTIONS=0                 # Disable exceptions
    )
  set(PLAYER_COMPILER_DEFINES_RELEASE
    NDEBUG _NDEBUG                    # Not a debug build
    )
  
  # Compile flags.
  target_compile_options(${TARGET} PRIVATE ${CEF_COMPILER_FLAGS} ${CEF_CXX_COMPILER_FLAGS})
  target_compile_options(${TARGET} PRIVATE $<$<CONFIG:Debug>:${PLAYER_COMPILER_FLAGS_DEBUG}>)
  target_compile_options(${TARGET} PRIVATE $<$<CONFIG:Release>:${PLAYER_COMPILER_FLAGS_RELEASE}>)

  # Compile definitions.
  target_compile_definitions(${TARGET} PRIVATE ${PLAYER_COMPILER_DEFINES})
  target_compile_definitions(${TARGET} PRIVATE $<$<CONFIG:Release>:${PLAYER_COMPILER_DEFINES_RELEASE}>)
  
  set_property(TARGET ${TARGET} PROPERTY LINK_FLAGS "/SUBSYSTEM:CONSOLE")
  set_property(TARGET ${TARGET} PROPERTY LINK_FLAGS_DEBUG ${PLAYER_LINKER_FLAGS_DEBUG})
endif()

