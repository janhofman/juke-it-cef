#
# Source files.
#

# Player module sources.
set (JUKEITAPP_FOLDER ${CMAKE_CURRENT_SOURCE_DIR}/../JukeItApp)
set(PLAYER_SRCS
  main.cpp
  ${JUKEITAPP_FOLDER}/MusicPlayer.h
  ${JUKEITAPP_FOLDER}/MusicPlayer.cc
  ${JUKEITAPP_FOLDER}/MusicPlayerAPI.h
  ${JUKEITAPP_FOLDER}/MusicPlayerAPI.cc
  ${JUKEITAPP_FOLDER}/SongCache.h
  ${JUKEITAPP_FOLDER}/SongCache.cpp
  )
  
source_group("Source files" FILES ${PLAYER_SRCS})

# Target executable name.
set(TARGET "JukeIt Player") 

set(TARGET_OUT_DIR "${CMAKE_CURRENT_BINARY_DIR}/$<CONFIGURATION>")

# find Boost and include it
set(Boost_USE_STATIC_LIBS OFF) 
set(Boost_USE_MULTITHREADED ON)  
set(Boost_USE_STATIC_RUNTIME OFF) 
find_package(Boost 1.67.0) 

if(Boost_FOUND)
    include_directories(${Boost_INCLUDE_DIRS})   
    link_directories(${Boost_LIBRARY_DIRS})
endif()

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/..)           # for portaudio
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../JukeItApp) # for headers for sources
  
if(OS_WINDOWS) 
  #
  # Executable target
  #        
  add_executable(${TARGET} WIN32 ${PLAYER_SRCS})
  
  set(PLAYER_COMPILER_FLAGS_DEBUG
    /MTd          # Multithreaded debug runtime  
    /RTC1         # Disable optimizations
    /Od           # Enable basic run-time checks   
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
  
  #
  # set differences for x64 / x86
  #   
  if("${CMAKE_GENERATOR}" MATCHES "(Win64|IA64)")
    # x64
    set(FFMPEG_DIRECTORY "${JUKEIT_LIBRARIES_DIR_PATH}/ffmpeg/win64")
    set(CPPRESTSDK_DIRECTORY "${JUKEIT_LIBRARIES_DIR_PATH}/cpprestsdk/win64")
  else()
    # x86
    set(FFMPEG_DIRECTORY "${JUKEIT_LIBRARIES_DIR_PATH}/ffmpeg/win32")
    set(CPPRESTSDK_DIRECTORY "${JUKEIT_LIBRARIES_DIR_PATH}/cpprestsdk/win32")
  endif()

  #
  #   FFMPEG SETTINGS
  #  
  
  include_directories("${FFMPEG_DIRECTORY}/include")
     
  set(FFMPEG_LIB_LOCATION 
    ${FFMPEG_DIRECTORY}/lib/avcodec.lib
    ${FFMPEG_DIRECTORY}/lib/avutil.lib
    ${FFMPEG_DIRECTORY}/lib/avformat.lib
  )
          
  #
  #   CPPRESTSDK SETTINGS
  #  
  
  include_directories("${CPPRESTSDK_DIRECTORY}/include")
  
  set(CPPRESTSDK_FILES
    bcrypt.lib
    crypt32.lib
    winhttp.lib
    #httpapi.lib
  )
  set(CPPRESTSDK_FILES_DEBUG
    "${CPPRESTSDK_DIRECTORY}/debug/lib/cpprest_2_10d.lib"
  )
  set(CPPRESTSDK_FILES_RELEASE
    "${CPPRESTSDK_DIRECTORY}/lib/cpprest_2_10.lib"
  )               
  
  add_definitions(-D_NO_ASYNCRTIMP -D_NO_PPLXIMP) 
  
  
  
  # link all libraries
  target_link_libraries(
    ${TARGET} 
    general ${CPPRESTSDK_FILES} 
    debug ${CPPRESTSDK_FILES_DEBUG} 
    optimized ${CPPRESTSDK_FILES_RELEASE} 
    ${FFMPEG_LIB_LOCATION} 
    portaudio_static
  )
  
  set(FFMPEG_BINARY_FILES
    avcodec-58.dll   
    avutil-56.dll
    avformat-58.dll       
    swresample-3.dll
  )

  # Copy binary and resource files to the target output directory.
  COPY_FILES("${TARGET}" "${FFMPEG_BINARY_FILES}" "${FFMPEG_DIRECTORY}/bin" "${TARGET_OUT_DIR}")
endif()