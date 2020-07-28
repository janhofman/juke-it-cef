# Copyright (c) 2014 The Chromium Embedded Framework Authors. All rights
# reserved. Use of this source code is governed by a BSD-style license that
# can be found in the LICENSE file.

#
# Source files.
#

# Player module sources.
set(PLAYER_SRCS
  MusicPlayer.h
  MusicPlayer.cc
  MusicPlayerAPI.h
  MusicPlayerAPI.cc
  SongCache.h
  SongCache.cpp
  )
  
source_group(JukeItApp\\\\Player FILES ${PLAYER_SRCS})

# Fileserver module sources.
set(FILESERVER_SRCS
  AudioInspector.h
  AudioInspector.cc
  FileServerHandler.h
  FileServerHandler.cc
  rest.h
  rest.cpp
  SqliteAPI.h
  SqliteAPI.cc
  tinyfiledialogs.h
  tinyfiledialogs.c
  )
  
source_group(JukeItApp\\\\Fileserver FILES ${FILESERVER_SRCS})
  
# Message handler sources.
set(MSGHANDLER_SRCS
  abstract_message_handler.h
  abstract_message_handler.cc
  AbstractFileServerHandler.h
  MsgHandler_FileServer.h
  MsgHandler_FileServer.cc
  MsgHandler_MusicPlayer.h
  MsgHandler_MusicPlayer.cc
  MsgHandler_Configuration.h
  MsgHandler_Configuration.cc
  MsgHandler_WebLogger.h
  MsgHandler_WebLogger.cc
  )   
  
source_group("JukeItApp\\\\Message Handlers" FILES ${MSGHANDLER_SRCS})

# CEF sources.
set(CEF_SRCS
  app_browser_impl.h
  app_browser_impl.cc
  app_factory.h   
  app_renderer_impl.h
  app_renderer_impl.cc
  browser_util.h
  browser_util.cc
  client_impl.h
  client_impl.cc
  client_manager.h
  client_manager.cc
  client_util.h
  client_util.cc
  main.h
  main_minimal.cc
  main_util.h
  main_util.cc
  resource_util.h
  resource_util.cc
  )     

set(CEF_SRCS_LINUX
  cefsimple_linux.cc
  client_util_linux.cc
  resource_util_linux.cc
  resource_util_posix.cc
  )
set(CEF_SRCS_MACOSX
  cefsimple_mac.mm
  simple_handler_mac.mm
  client_util_mac.mm
  resource_util_mac.mm
  )
set(CEF_SRCS_WINDOWS
  JukeItApp.exe.manifest
  compatibility.manifest
  client_util_win.cc
  JukeItApp.rc
  cefsimple_win.cc
  resource.h
  resource_util_win.cc
  resource_util_win_impl.cc
  )
APPEND_PLATFORM_SOURCES(CEF_SRCS)   
source_group(JukeItApp\\\\CEF FILES ${CEF_SRCS})

set(JUKEITAPP_SRCS
  ${PLAYER_SRCS}     
  ${FILESERVER_SRCS}
  ${MSGHANDLER_SRCS}   
  ${CEF_SRCS}
 )

set(JUKEITAPP_RES_SRCS_WINDOWS
  res/cefsimple.ico
  res/small.ico
  )
APPEND_PLATFORM_SOURCES(JUKEITAPP_RES_SRCS)
source_group(JukeItApp\\\\res FILES ${JUKEITAPP_RES_SRCS})

set(JUKEITAPP_SRCS
  ${JUKEITAPP_SRCS}
  ${JUKEITAPP_RES_SRCS}
  )

# JukeItApp helper sources.
set(JUKEITAPP_HELPER_SRCS_MACOSX
  process_helper_mac.cc
  )
APPEND_PLATFORM_SOURCES(JUKEITAPP_HELPER_SRCS)
source_group(JukeItApp FILES ${JUKEITAPP_HELPER_SRCS})

# JukeItApp resources.
set(JUKEITAPP_RESOURCES_MAC_SRCS_MACOSX
  mac/Info.plist
  mac/cefsimple.icns
  )
APPEND_PLATFORM_SOURCES(JUKEITAPP_RESOURCES_MAC_SRCS)
source_group(JukeItApp\\\\mac FILES ${JUKEITAPP_RESOURCES_MAC_SRCS})

set(JUKEITAPP_RESOURCES_MAC_ENGLISH_LPROJ_SRCS_MACOSX
  mac/English.lproj/InfoPlist.strings
  mac/English.lproj/MainMenu.xib
  )
APPEND_PLATFORM_SOURCES(JUKEITAPP_RESOURCES_MAC_ENGLISH_LPROJ_SRCS)
source_group(JukeItApp\\\\mac\\\\English.lproj FILES ${JUKEITAPP_RESOURCES_MAC_ENGLISH_LPROJ_SRCS})

set(JUKEITAPP_RESOURCES_SRCS
  ${JUKEITAPP_RESOURCES_MAC_SRCS}
  ${JUKEITAPP_RESOURCES_MAC_ENGLISH_LPROJ_SRCS}
  )


#
# Shared configuration.
#

# Target executable names.
set(CEF_TARGET "JukeItApp")
if(OS_MACOSX)
  set(CEF_HELPER_TARGET "JukeItApp Helper")
endif()

# Logical target used to link the libcef library.
ADD_LOGICAL_TARGET("libcef_lib" "${CEF_LIB_DEBUG}" "${CEF_LIB_RELEASE}")

# Determine the target output directory.
SET_CEF_TARGET_OUT_DIR()


#
# Linux configuration.
#

if(OS_LINUX)
  # find Boost and include it
  set(Boost_USE_STATIC_LIBS OFF) 
  set(Boost_USE_MULTITHREADED ON)  
  set(Boost_USE_STATIC_RUNTIME OFF) 
  find_package(Boost 1.67.0) 
  
  if(Boost_FOUND)
      include_directories(${Boost_INCLUDE_DIRS})   
      link_directories(${Boost_LIBRARY_DIRS})
  endif()

  # find FFmpeg and include it
  find_package(FFMPEG REQUIRED) 
  
  if(FFMPEG_FOUND)
      include_directories(${FFMPEG_INCLUDE_DIRS})   
      link_directories(${FFMPEG_LIBRARIES})
      message(STATUS "FFMPEG DEFINITIONS:                     ${FFMPEG_DEFINITIONS}")  
  endif()

  set(FFMPEG_LINK_LIBRARIES
    ${AVCODEC_LIBRARIES}
    ${AVUTIL_LIBRARIES}
    ${AVFORMAT_LIBRARIES}
  )  

  # find CPPRESTSDK
  set(cpprestsdk_DIR /usr/lib/${CMAKE_LIBRARY_ARCHITECTURE}/cmake/)
  message(STATUS "CPP REST SDK DIRECTORY:   ${cpprestsdk_DIR}")  
  find_package(cpprestsdk REQUIRED)

  list(APPEND CEF_COMPILER_FLAGS
    -Wno-error=maybe-uninitialized           # don't treat this warning as error, causes false positives on gcc
    -Wno-error=format-security               # don't treat error output formatting as errors
    -Wno-error=unused-but-set-variable       # unfinished return values
    -Wno-error=format-overflow               # tinyfiledialogs sprintf errors
    -Wno-error=parentheses                   # boost library issues
    )

  # Executable target.
  add_executable(${CEF_TARGET} ${JUKEITAPP_SRCS})
  SET_EXECUTABLE_TARGET_PROPERTIES(${CEF_TARGET})
  add_dependencies(${CEF_TARGET} libcef_dll_wrapper sqlite3)
  target_link_libraries(
    ${CEF_TARGET}
    PRIVATE boost_system
    PRIVATE cpprestsdk::cpprest
    sqlite3 
    portaudio_static
    ${FFMPEG_LINK_LIBRARIES} 
    libcef_lib
    libcef_dll_wrapper
    ${CEF_STANDARD_LIBS}
    ${CMAKE_DL_LIBS} # dynamic linking
    stdc++fs # filesystem library
  )

  # Set rpath so that libraries can be placed next to the executable.
  set_target_properties(${CEF_TARGET} PROPERTIES INSTALL_RPATH "$ORIGIN")
  set_target_properties(${CEF_TARGET} PROPERTIES BUILD_WITH_INSTALL_RPATH TRUE)
  set_target_properties(${CEF_TARGET} PROPERTIES RUNTIME_OUTPUT_DIRECTORY ${CEF_TARGET_OUT_DIR})

  # Force using C++ 17
  set_target_properties(${CEF_TARGET} PROPERTIES CXX_STANDARD 17 CXX_STANDARD_REQUIRED ON)

  # Copy binary and resource files to the target output directory.
  COPY_FILES("${CEF_TARGET}" "${CEF_BINARY_FILES}" "${CEF_BINARY_DIR}" "${CEF_TARGET_OUT_DIR}")
  COPY_FILES("${CEF_TARGET}" "${CEF_RESOURCE_FILES}" "${CEF_RESOURCE_DIR}" "${CEF_TARGET_OUT_DIR}")

  # Set SUID permissions on the chrome-sandbox target.
  SET_LINUX_SUID_PERMISSIONS("${CEF_TARGET}" "${CEF_TARGET_OUT_DIR}/chrome-sandbox")
endif()


#
# Mac OS X configuration.
#

if(OS_MACOSX)
  # Output paths for the app bundles.
  set(CEF_APP "${CEF_TARGET_OUT_DIR}/${CEF_TARGET}.app")
  set(CEF_HELPER_APP "${CEF_TARGET_OUT_DIR}/${CEF_HELPER_TARGET}.app")

  # Variable referenced from Info.plist files.
  set(PRODUCT_NAME "${CEF_TARGET}")

  # Helper executable target.
  add_executable(${CEF_HELPER_TARGET} MACOSX_BUNDLE ${JUKEITAPP_HELPER_SRCS})
  SET_EXECUTABLE_TARGET_PROPERTIES(${CEF_HELPER_TARGET})
  add_dependencies(${CEF_HELPER_TARGET} libcef_dll_wrapper)
  target_link_libraries(${CEF_HELPER_TARGET} libcef_lib libcef_dll_wrapper ${CEF_STANDARD_LIBS})
  set_target_properties(${CEF_HELPER_TARGET} PROPERTIES
    MACOSX_BUNDLE_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/mac/helper-Info.plist
    )

  # Fix the framework rpath in the helper executable.
  FIX_MACOSX_HELPER_FRAMEWORK_RPATH(${CEF_HELPER_TARGET})

  # Main executable target.
  add_executable(${CEF_TARGET} MACOSX_BUNDLE ${JUKEITAPP_RESOURCES_SRCS} ${JUKEITAPP_SRCS})
  SET_EXECUTABLE_TARGET_PROPERTIES(${CEF_TARGET})
  add_dependencies(${CEF_TARGET} libcef_dll_wrapper "${CEF_HELPER_TARGET}")
  target_link_libraries(${CEF_TARGET} libcef_lib libcef_dll_wrapper ${CEF_STANDARD_LIBS})
  set_target_properties(${CEF_TARGET} PROPERTIES
    MACOSX_BUNDLE_INFO_PLIST ${CMAKE_CURRENT_SOURCE_DIR}/mac/Info.plist
    )

  # Copy files into the main app bundle.
  add_custom_command(
    TARGET ${CEF_TARGET}
    POST_BUILD
    # Copy the helper app bundle into the Frameworks directory.
    COMMAND ${CMAKE_COMMAND} -E copy_directory
            "${CEF_HELPER_APP}"
            "${CEF_APP}/Contents/Frameworks/${CEF_HELPER_TARGET}.app"
    # Copy the CEF framework into the Frameworks directory.
    COMMAND ${CMAKE_COMMAND} -E copy_directory
            "${CEF_BINARY_DIR}/Chromium Embedded Framework.framework"
            "${CEF_APP}/Contents/Frameworks/Chromium Embedded Framework.framework"
    VERBATIM
    )

  # Fix the framework rpath in the main executable.
  FIX_MACOSX_MAIN_FRAMEWORK_RPATH(${CEF_TARGET})

  # Manually process and copy over resource files.
  # The Xcode generator can support this via the set_target_properties RESOURCE
  # directive but that doesn't properly handle nested resource directories.
  # Remove these prefixes from input file paths.
  set(PREFIXES "mac/")
  COPY_MACOSX_RESOURCES("${JUKEITAPP_RESOURCES_SRCS}" "${PREFIXES}" "${CEF_TARGET}" "${CMAKE_CURRENT_SOURCE_DIR}" "${CEF_APP}")
endif()


#
# Windows configuration.
#

if(OS_WINDOWS)
  # Executable target.

  # set policy for find_package to look for *_ROOT environment variables
  cmake_policy(SET CMP0074 NEW)
  
  # find Boost and include it
  set(Boost_USE_STATIC_LIBS OFF) 
  set(Boost_USE_MULTITHREADED ON)  
  set(Boost_USE_STATIC_RUNTIME OFF) 
  find_package(Boost 1.67.0 REQUIRED) 
  
  if(Boost_FOUND)
      include_directories(${Boost_INCLUDE_DIRS})   
      link_directories(${Boost_LIBRARY_DIRS})
  endif()
  
  add_executable(${CEF_TARGET} WIN32 ${JUKEITAPP_SRCS})
  add_dependencies(${CEF_TARGET} libcef_dll_wrapper sqlite3 spdlog)
  SET_EXECUTABLE_TARGET_PROPERTIES(${CEF_TARGET})
  # require C++ 17 standard
  set_target_properties(${CEF_TARGET} PROPERTIES CXX_STANDARD 17)
  # require run as admin
  #set_target_properties(${CEF_TARGET} PROPERTIES LINK_FLAGS "/MANIFESTUAC:\"level='requireAdministrator' uiAccess='false'\" /SUBSYSTEM:WINDOWS")
  
  #
  # set differences for x64 / x86
  #
  
  if("${CMAKE_GENERATOR}" MATCHES "(Win64|IA64)" OR ${CMAKE_SIZEOF_VOID_P} EQUAL "8")
    # x64
    set(FFMPEG_DIRECTORY "${JUKEIT_LIBRARIES_DIR_PATH}/ffmpeg/win64")
    set(CPPRESTSDK_DIRECTORY "${JUKEIT_LIBRARIES_DIR_PATH}/cpprestsdk/win64")
  else()
    # x86
    set(FFMPEG_DIRECTORY "${JUKEIT_LIBRARIES_DIR_PATH}/ffmpeg/win32")
    set(CPPRESTSDK_DIRECTORY "${JUKEIT_LIBRARIES_DIR_PATH}/cpprestsdk/win32")
    # FFMPEG is built with SAFESEH:NO, we must propagate this further
    SET(CMAKE_CXX_FLAGS           "${CMAKE_CXX_FLAGS} /D \"SAFESEH:NO\"")
    SET(CMAKE_EXE_LINKER_FLAGS    "${CMAKE_EXE_LINKER_FLAGS} /SAFESEH:NO")
    SET(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} /SAFESEH:NO")
    SET(CMAKE_MODULE_LINKER_FLAGS "${CMAKE_MODULE_LINKER_FLAGS} /SAFESEH:NO")
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
    httpapi.lib       
    "${CPPRESTSDK_DIRECTORY}/lib/zlib.lib"
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
    ${CEF_TARGET} 
    general ${CPPRESTSDK_FILES} 
    debug ${CPPRESTSDK_FILES_DEBUG} 
    optimized ${CPPRESTSDK_FILES_RELEASE} 
    ${FFMPEG_LIB_LOCATION} 
    sqlite3 
    portaudio_static 
    spdlog::spdlog_header_only
    libcef_lib 
    libcef_dll_wrapper 
    ${CEF_STANDARD_LIBS}
  )

  if(USE_SANDBOX)
    # Logical target used to link the cef_sandbox library.
    ADD_LOGICAL_TARGET("cef_sandbox_lib" "${CEF_SANDBOX_LIB_DEBUG}" "${CEF_SANDBOX_LIB_RELEASE}")
    target_link_libraries(${CEF_TARGET} cef_sandbox_lib ${CEF_SANDBOX_STANDARD_LIBS})
  endif()

  # Add the custom manifest files to the executable.
  ADD_WINDOWS_MANIFEST("${CMAKE_CURRENT_SOURCE_DIR}" "${CEF_TARGET}" "exe")
  
  set(FFMPEG_BINARY_FILES
    avcodec-58.dll   
    avutil-56.dll
    avformat-58.dll       
    swresample-3.dll
  )      

  # Copy binary and resource files to the target output directory.
  COPY_FILES("${CEF_TARGET}" "${CEF_BINARY_FILES}" "${CEF_BINARY_DIR}" "${CEF_TARGET_OUT_DIR}")
  COPY_FILES("${CEF_TARGET}" "${CEF_RESOURCE_FILES}" "${CEF_RESOURCE_DIR}" "${CEF_TARGET_OUT_DIR}")
  COPY_FILES("${CEF_TARGET}" "${FFMPEG_BINARY_FILES}" "${FFMPEG_DIRECTORY}/bin" "${CEF_TARGET_OUT_DIR}")
endif()
