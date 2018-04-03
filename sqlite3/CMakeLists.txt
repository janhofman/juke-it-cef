cmake_minimum_required(VERSION 2.8.12.1)

project ( sqlite3 C )

set(SQLITE_TARGET sqlite3)

set ( SOURCES include/sqlite3.c )
set ( HEADERS include/sqlite3.h include/sqlite3ext.h )

if ( WIN32 )
  if ( MSVC )
#    set ( CMAKE_SHARED_LINKER_FLAGS /DEF:sqlite3.def )
#    set ( SQLITE3_DEF_FILE "${CMAKE_CURRENT_BINARY_DIR}/sqlite3.def" )
#    add_definitions( "-DSQLITE_API=__declspec(dllexport)" )
    add_definitions( "/MT" )   # /MT flag to fix Missing VCRUNTIME140.dll
  endif ( MSVC )
endif ( WIN32 )

add_library (
  ${SQLITE_TARGET} 
  STATIC
  ${SOURCES}
  ${HEADERS}
)