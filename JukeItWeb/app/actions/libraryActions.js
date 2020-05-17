import axios from 'axios';
import { makeCancelable, EntityEnum } from './../utils';
import { checkFsConnection } from './devicesActions';
// import mm from 'musicmetadata';
// import fs from 'fs';
// import path from 'path';

export function setLoading(loading) {
  return {
    type: 'LIBRARY_LOADING',
    payload: loading,
  };
}

// CHANGE

export function songsChange(loaded, songs) {
  return {
    type: 'LIBRARY_SONGS_CHANGE',
    payload: { songsLoaded: loaded, songs },
  };
}

export function artistsChange(loaded, artists) {
  return {
    type: 'LIBRARY_ARTISTS_CHANGE',
    payload: { artistsLoaded: loaded, artists },
  };
}

export function albumsChange(loaded, albums) {
  return {
    type: 'LIBRARY_ALBUMS_CHANGE',
    payload: { albumsLoaded: loaded, albums },
  };
}

export function genresChange(loaded, genres) {
  return {
    type: 'LIBRARY_GENRES_CHANGE',
    payload: { genresLoaded: loaded, genres },
  };
}

export function playlistsChange(loaded, playlists) {
  return {
    type: 'PLAYLISTS_CHANGE',
    payload: { playlists, playlistsLoaded: loaded },
  };
}

// PROMISE

export function setSongsPromise(promise) {
  return {
    type: 'LIBRARY_SET_PROMISE_SONGS',
    payload: promise,
  };
}

export function setAlbumsPromise(promise) {
  return {
    type: 'LIBRARY_SET_PROMISE_ALBUMS',
    payload: promise,
  };
}

export function setArtistsPromise(promise) {
  return {
    type: 'LIBRARY_SET_PROMISE_ARTISTS',
    payload: promise,
  };
}

export function setGenresPromise(promise) {
  return {
    type: 'LIBRARY_SET_PROMISE_GENRES',
    payload: promise,
  };
}

export function setPlaylistsPromise(promise) {
  return {
    type: 'PLAYLISTS_SET_PROMISE',
    payload: promise,
  };
}

// CLEAN

export function cleanSongs() {
  return (dispatch, getState) => {
    const { songsPromise } = getState().library;
    if (songsPromise) {
      songsPromise.cancel();
    }
    dispatch(songsChange(false, []));
  };
}

export function cleanAlbums() {
  return (dispatch, getState) => {
    const { albumsPromise } = getState().library;
    if (albumsPromise) {
      albumsPromise.cancel();
    }
    dispatch(albumsChange(false, []));
  };
}

export function cleanArtists() {
  return (dispatch, getState) => {
    const { artistsPromise } = getState().library;
    if (artistsPromise) {
      artistsPromise.cancel();
    }
    dispatch(artistsChange(false, []));
  };
}

export function cleanGenres() {
  return (dispatch, getState) => {
    const { genresPromise } = getState().library;
    if (genresPromise) {
      genresPromise.cancel();
    }
    dispatch(genresChange(false, []));
  };
}

export function cleanPlaylists() {
  return (dispatch, getState) => {
    const { playlistsPromise } = getState().playlists;
    if (playlistsPromise) {
      playlistsPromise.cancel();
    }
    dispatch(playlistsChange(false, []));
  };
}

export function cleanLibrary() {
  return (dispatch) => {
    dispatch(cleanAlbums());
    dispatch(cleanArtists());
    dispatch(cleanGenres());
    dispatch(cleanSongs());
    dispatch(cleanPlaylists());
  };
}

// LOAD

export function loadAlbums() {
  return (dispatch, getState) => {
    const {
      library: {
        albumsLoaded,
      },
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    if (!albumsLoaded) {
      dispatch(cleanAlbums());
      let promise = getAllAlbums(baseAddress);
      promise = makeCancelable(promise);
      promise.promise
        .then((albums) => dispatch(albumsChange(true, albums)))
        .catch((err) => console.log(err));  // TODO: add catch
      dispatch(setAlbumsPromise(promise));
    }
  };
}

export function addSongs() {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(setLoading(true));
    const request = JSON.stringify({
      command: 'FLS_ADD_FILES',
    });
    cefQuery({
      request,
      onSuccess(response) {
        console.log(response);
        dispatch(cleanLibrary());
        dispatch(setLoading(false));
      },
      onFailure(errorCode, errorMessage) {
        // catch error
        console.log(`Add songs error: ${errorCode} ${errorMessage}`);
        dispatch(setLoading(false));
      },
    });
  };
}

export function removeFiles(filesToRemove) {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(setLoading(true));
    const request = JSON.stringify({
      command: 'FLS_REMOVE_FILES',
      payload: {
        remove: filesToRemove,
      },
    });
    cefQuery({
      request,
      onSuccess(response) {
        console.log(response);
        dispatch(cleanLibrary());
        dispatch(setLoading(false));
      },
      onFailure(errorCode, errorMessage) {
        // catch error
        console.log(`Remove files error: ${errorCode} ${errorMessage}`);
        dispatch(setLoading(false));
      },
    });
  };
}

export function apiSongPromise(baseUrl, songId) {
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/songs/${songId.toString()}`;
  return axios.get(url, { validateStatus: validateStatus200_OK }).then((response) => {
    return response.data;
  });
}

/**
 * Creates Songs request promise.
 * @param {string} baseUrl File Server base url.
 * @param {number} limit   Maximum number of items in response.
 * @param {number} start   Index of the first item (numbering starts from 1)
 * @param {string} orderby Column by which the result should be sorted by, use one of these values: title, artist, album, genre, duration.
 * @param {bool}   desc    Decides whether results will be sorted in ascending or descending order.
 * @param {string} filter  Specifies a string to look for in song titles.
 * @return {Promise} A promise returning response to Songs request.
 */
export function apiSongsPromise(baseUrl, limit = 100, start = 1, orderby = null, desc = false, filter = null) {
  console.log('Start: ', start, ' Limit: ', limit);
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/songs`;
  const params = {
    limit,
    start,
  };
  if (desc) {
    params.desc = 'desc';
  }
  if (orderby) {
    params.orderby = orderby;
  }
  if (filter) {
    params.filter = filter;
  }
  return axios.get(url, { params, validateStatus: validateStatus200_OK }).then((response) => {
    return response.data;
  });
}

function getAllSongsContinuation(baseUrl, limit, start, orderby, desc, filter, songs, result) {
  const newSongs = songs.concat(result);
  if (result.length === limit) {
    const nextStart = start + limit;
    return apiSongsPromise(baseUrl, limit, nextStart, orderby, desc, filter)
      .then((result2) => getAllSongsContinuation(baseUrl, limit, nextStart, orderby, desc, filter, newSongs, result2));
  }
  return newSongs;
}

export function getAllSongs(baseUrl, orderby = null, desc = false, filter = null) {
  const limit = 3;
  const start = 1;
  return apiSongsPromise(baseUrl, limit, start, orderby, desc, filter)
    .then((result) => getAllSongsContinuation(baseUrl, limit, start, orderby, desc, filter, [], result));
}

/**
 * Creates Albums request promise.
 * @param {string} baseUrl File Server base url.
 * @param {number} limit   Maximum number of items in response.
 * @param {number} start   Index of the first item (numbering starts from 1)
 * @param {string} orderby Column by which the result should be sorted by, use one of these values: name, artist.
 * @param {bool}   desc    Decides whether results will be sorted in ascending or descending order.
 * @param {string} filter  Specifies a string to look for in album titles.
 * @return {Promise} A promise returning response to Albums request.
 */
export function apiAlbumsPromise(baseUrl, limit = 100, start = 1, orderby = null, desc = false, filter = null) {
  console.log('Start: ', start, ' Limit: ', limit);
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/albums`;
  const params = {
    limit,
    start,
  };
  if (desc) {
    params.desc = 'desc';
  }
  if (orderby) {
    params.orderby = orderby;
  }
  if (filter) {
    params.filter = filter;
  }
  return axios.get(url, { params, validateStatus: validateStatus200_OK }).then((response) => {    
    return response.data;
  });
}

export function apiAlbumPromise(baseUrl, albumId) {
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/albums/${albumId.toString()}`;
  return axios.get(url, { validateStatus: validateStatus200_OK }).then((response) => {
    return response.data;
  });
}

function getAllAlbumsContinuation(baseUrl, limit, start, orderby, desc, filter, albums, result) {
  const newAlbums = albums.concat(result);
  if (result.length === limit) {
    const nextStart = start + limit;
    return apiAlbumsPromise(baseUrl, limit, nextStart, orderby, desc, filter)
      .then((result2) => getAllAlbumsContinuation(baseUrl, limit, nextStart, orderby, desc, filter, newAlbums, result2));
  }
  return newAlbums;
}

export function getAllAlbums(baseUrl, orderby = null, desc = false, filter = null) {
  const limit = 1;
  const start = 1;
  return apiAlbumsPromise(baseUrl, limit, start, orderby, desc, filter)
    .then((result) => getAllAlbumsContinuation(baseUrl, limit, start, orderby, desc, filter, [], result));
}

/**
 * Creates Genres request promise.
 * @param {string} baseUrl File Server base url.
 * @param {number} limit   Maximum number of items in response.
 * @param {number} start   Index of the first item (numbering starts from 1)
 * @param {bool}   desc    Decides whether results will be sorted in ascending or descending order.
 * @param {string} filter  Specifies a string to look for in genre names.
 * @return {Promise} A promise returning response to Genres request.
 */
export function apiGenresPromise(baseUrl, limit = 100, start = 1, desc = false, filter = null) {
  console.log('Start: ', start, ' Limit: ', limit);
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/genres`;
  const params = {
    limit,
    start,
  };
  if (desc) {
    params.desc = 'desc';
  }
  if (filter) {
    params.filter = filter;
  }
  return axios.get(url, { params, validateStatus: validateStatus200_OK }).then((response) => {    
    return response.data;
  });
}

export function apiGenrePromise(baseUrl, genreId) {
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/genres/${genreId.toString()}`;
  return axios.get(url, { validateStatus: validateStatus200_OK }).then((response) => {    
    return response.data;
  });
}

function getAllGenresContinuation(baseUrl, limit, start, desc, filter, genres, result) {
  const newGenres = genres.concat(result);
  if (result.length === limit) {
    const nextStart = start + limit;
    return apiGenresPromise(baseUrl, limit, nextStart, desc, filter)
      .then((result2) => getAllGenresContinuation(baseUrl, limit, nextStart, desc, filter, newGenres, result2));
  }
  return newGenres;
}

export function getAllGenres(baseUrl, desc = false, filter = null) {
  const limit = 1;
  const start = 1;
  return apiGenresPromise(baseUrl, limit, start, desc, filter)
    .then((result) => getAllGenresContinuation(baseUrl, limit, start, desc, filter, [], result));
}

/**
 * Creates Artists request promise.
 * @param {string} baseUrl File Server base url.
 * @param {number} limit   Maximum number of items in response.
 * @param {number} start   Index of the first item (numbering starts from 1)
 * @param {bool}   desc    Decides whether results will be sorted in ascending or descending order.
 * @param {string} filter  Specifies a string to look for in artist names.
 * @return {Promise} A promise returning response to Artists request.
 */
export function apiArtistsPromise(baseUrl, limit = 100, start = 1, desc = false, filter = null) {
  console.log('Start: ', start, ' Limit: ', limit);
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/artists`;
  const params = {
    limit,
    start,
  };
  if (desc) {
    params.desc = 'desc';
  }
  if (filter) {
    params.filter = filter;
  }
  return axios.get(url, { params, validateStatus: validateStatus200_OK }).then((response) => {
    return response.data;
  });
}

function getAllArtistsContinuation(baseUrl, limit, start, desc, filter, artists, result) {
  const newArtists = artists.concat(result);
  if (result.length === limit) {
    const nextStart = start + limit;
    return apiArtistsPromise(baseUrl, limit, nextStart, desc, filter)
      .then((result2) => getAllArtistsContinuation(baseUrl, limit, nextStart, desc, filter, newArtists, result2));
  }
  return newArtists;
}

export function getAllArtists(baseUrl, desc = false, filter = null) {
  const limit = 1;
  const start = 1;
  return apiArtistsPromise(baseUrl, limit, start, desc, filter)
    .then((result) => getAllArtistsContinuation(baseUrl, limit, start, desc, filter, [], result));
}

export function apiArtistPromise(baseUrl, artistId) {
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/artists/${artistId.toString()}`;
  return axios.get(url, { validateStatus: validateStatus200_OK }).then((response) => {
    return response.data;
  });
}

/**
 * Creates Playlists request promise.
 * @param {string} baseUrl File Server base url.
 * @param {string} userId  ID of user.
 * @param {number} limit   Maximum number of items in response.
 * @param {number} start   Index of the first item (numbering starts from 1)
 * @param {bool}   desc    Decides whether results will be sorted in ascending or descending order.
 * @param {string} filter  Specifies a string to look for in artist names.
 * @return {Promise} A promise returning response to Artists request.
 */
export function apiPlaylistsPromise(baseUrl, userId, limit = 100, start = 1, desc = false, filter = null) {
  console.log('Start: ', start, ' Limit: ', limit);
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/playlists/${userId.toString()}`;
  const params = {
    limit,
    start,
  };
  if (desc) {
    params.desc = 'desc';
  }
  if (filter) {
    params.filter = filter;
  }
  return axios.get(url, { params, validateStatus: validateStatus200_OK }).then((response) => {
    return response.data;
  });
}

function getAllPlaylistsContinuation(baseUrl, userId, limit, start, desc, filter, playlists, result) {
  const newPlaylists = playlists.concat(result);
  if (result.length === limit) {
    const nextStart = start + limit;
    return apiPlaylistsPromise(baseUrl, userId, limit, nextStart, desc, filter)
      .then((result2) => getAllPlaylistsContinuation(baseUrl, userId, limit, nextStart, desc, filter, newPlaylists, result2));
  }
  return newPlaylists;
}

export function getAllPlaylists(baseUrl, userId, desc = false, filter = null) {
  const limit = 1;
  const start = 1;
  return apiPlaylistsPromise(baseUrl, userId, limit, start, desc, filter)
    .then((result) => getAllPlaylistsContinuation(baseUrl, userId, limit, start, desc, filter, [], result));
}

export function apiPlaylistPromise(baseUrl, playlistId, userId) {
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/playlists/${userId.toString()}/${playlistId.toString()}`;
  return axios.get(url, { validateStatus: validateStatus200_OK }).then((response) => {
    return response.data;
  });
}

/**
 * Creates request promise that gets songs for entity.
 * @param {string}     baseUrl  - File Server base url.
 * @param {EntityEnum} entity   - Collection entity type.
 * @param {string}     entitiId - ID of desired entity.
 * @param {string}     userId   - ID of user, used only for playlist entity.
 * @param {number}     limit    - Maximum number of items in response.
 * @param {number}     start   Index of the first item (numbering starts from 1)
 * @param {bool}       desc     - Decides whether results will be sorted in ascending or descending order.
 * @param {string}     filter   - Specifies a string to look for in artist names.
 * @return {Promise} A promise returning response to Artists request.
 */
export function apiEntitySongsPromise(baseUrl, entity, entityId, userId = null, limit = 100, start = 1, orderby = null, desc = false, filter = null) {
  console.log('Start: ', start, ' Limit: ', limit);
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  let entityName;
  switch (entity) {
    case EntityEnum.PLAYLIST :
      // for playlists we need to add userId
      entityName = `playlists/${userId.toString()}`;
      break;
    case EntityEnum.ALBUM:
      entityName = 'albums';
      break;
    case EntityEnum.ARTIST :
      entityName = 'artists';
      break;
    case EntityEnum.GENRE:
      entityName = 'genres';
      break;
  }
  url = `${url}v1/${entityName}/${entityId.toString()}/songs`;
  console.log('URL: ', url);
  const params = {
    limit,
    start,
  };
  if (orderby) {
    params.orderby = orderby;
  }
  if (desc) {
    params.desc = 'desc';
  }
  if (filter) {
    params.filter = filter;
  }
  return axios.get(url, { params, validateStatus: validateStatus200_OK }).then((response) => {
    return response.data;
  });
}

function getAllEntitySongsContinuation(baseUrl, entity, entityId, userId, limit, start, orderby, desc, filter, songs, result) {
  const newSongs = songs.concat(result);
  if (result.length === limit) {
    const nextStart = start + limit;
    return apiEntitySongsPromise(baseUrl, entity, entityId, userId, limit, nextStart, orderby, desc, filter)
      .then((result2) => getAllEntitySongsContinuation(baseUrl, entity, entityId, userId, limit, nextStart, orderby, desc, filter, newSongs, result2));
  }
  return newSongs;
}

export function getAllEntitySongs(baseUrl, entity, entityId, userId, orderby = null, desc = false, filter = null) {
  const limit = 3
  const start = 1;
  return apiEntitySongsPromise(baseUrl, entity, entityId, userId, limit, start, orderby, desc, filter)
    .then((result) => getAllEntitySongsContinuation(baseUrl, entity, entityId, userId, limit, start, orderby, desc, filter, [], result));
}

function validateStatus200_OK(status) {
  return status === 200; // Resolve only if the status code is 200 OK
}

/*** PLAYLIST ACTIONS MOVED HERE ***/


export function showDialog(show) {
  return {
    type: 'PLAYLISTS_SHOW_DIALOG',
    payload: show,
  };
}

export function loadPlaylists() {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    const {
      devices: {
        fileServer: {
          baseAddress,
        },
      },
      userData: {
        userId,
      },
      playlists: {
        playlistsLoaded,
      },
    } = getState();

    if (!playlistsLoaded) {
      dispatch(cleanPlaylists());
      let promise = getAllPlaylists(baseAddress, userId);
      promise = makeCancelable(promise);
      promise.promise
        .then((playlists) => {
          dispatch(playlistsChange(true, playlists));
          resolve();
        })
        .catch((err) => {
          dispatch(cleanPlaylists());
          dispatch(checkFsConnection());
          reject(err);
        });
      dispatch(setPlaylistsPromise(promise));
    } else {
      resolve()
    }
  });
}

export function addNewPlaylist(name, description) {
  return (dispatch, getState) => {
    const {
      userData: {
        userId,
      },
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    const url = `${baseAddress}/v1/playlists/${userId}`;
    const newPlaylist = {
      name,
      description,
    };

    axios.post(url, newPlaylist)
      .then((response) => {
        console.log('Response: ', response);
        dispatch(cleanPlaylists());
        dispatch(loadPlaylists());
        dispatch(showDialog(false));
      })
      .catch((error) => {
        console.log('Error: ', error);
        dispatch(showDialog(false));
      });
  };
}

/**
 * Adds songs to playlist.
 * @param {string} playlistId ID of playlist.
 * @param {array(string)} songs Array of song IDs to be added to playlist.
 * @returns {function} Dispatchable action.
 */
export function addSongsToPlaylist(playlistId, songs) {
  return (dispatch, getState) => {
    const {
      userData: {
        userId,
      },
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    let url = baseAddress;
    if (!url.endsWith('/')) {
      url += '/';
    }
    url = `${url}v1/playlists/${userId}/${playlistId}/songs`;

    const data = {
      add: songs,
      remove: [],
    };
    axios.put(url, data)
      .then((response) => {
        console.log('Response: ', response);
        dispatch(cleanPlaylists());
      }).catch((error) => {
        console.log('Error: ', error);
      });
  };
}

/**
 * Adds single song to playlist.
 * @param {string} playlistId ID of playlist.
 * @param {string} songId ID of song to be added to playlist.
 * @returns {function} Dispatchable action.
 */
export function addSongToPlaylist(playlistId, songId) {
  return (dispatch, getState) => {
    const {
      userData: {
        userId,
      },
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    let url = baseAddress;
    if (!url.endsWith('/')) {
      url += '/';
    }
    url = `${url}v1/playlists/${userId}/${playlistId}/songs`;

    const data = {
      add: [songId],
      remove: [],
    };
    axios.put(url, data)
      .then((response) => {
        console.log('Response: ', response);
        dispatch(cleanPlaylists());
      }).catch((error) => {
        console.log('Error: ', error);
      });
  };
}

/**
 * Remove songs from playlist.
 * @param {string} playlistId ID of playlist.
 * @param {array(string)} songs Array of song IDs to be removed from playlist.
 * @returns {function} Dispatchable action.
 */
export function removeSongsFromPlaylist(playlistId, songs) {
  return (dispatch, getState) => {
    const {
      userData: {
        userId,
      },
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    let url = baseAddress;
    if (!url.endsWith('/')) {
      url += '/';
    }
    url = `${url}v1/playlists/${userId}/${playlistId}/songs`;

    const data = {
      add: [],
      remove: songs,
    };
    return axios.put(url, data, { validateStatus: validateStatus200_OK });      
  };
}