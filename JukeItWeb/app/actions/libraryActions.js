import { makeCancelable, Song } from './../utils';
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

export function cleanLibrary() {
  return (dispatch) => {
    dispatch(cleanAlbums());
    dispatch(cleanArtists());
    dispatch(cleanGenres());
    dispatch(cleanSongs());
  };
}

// LOAD

export function loadSongs() {
  return (dispatch, getState) => {
    const { cefQuery, library } = getState();
    const { songsLoaded } = library;
    if (!songsLoaded) {
      dispatch(cleanSongs);
      let promise = new Promise((resolve, reject) => {
        cefQuery({
          request: 'SQL_LOAD_SONGS',
          onSuccess: function (response) {
            console.log(response);
            const data = JSON.parse(response);
            resolve(data);
          },
          onFailure: function (errorCode, errorMessage) {
            reject(errorCode, errorMessage);
          },
        });
      });
      promise = makeCancelable(promise);
      promise.promise
                .then((songs) => dispatch(songsChange(true, songs)))
                .catch((err) => console.log(err));  // TODO: add catch
      dispatch(setSongsPromise(promise));
    }
  };
}

export function loadAlbums() {
  return (dispatch, getState) => {
    const { cefQuery, library } = getState();
    const { albumsLoaded } = library;
    if (!albumsLoaded) {
      dispatch(cleanAlbums());
      let promise = new Promise((resolve, reject) => {
        cefQuery({
          request: 'SQL_LOAD_ALBUMS',
          onSuccess: function (response) {
            console.log(response);
            const data = JSON.parse(response);
            resolve(data);
          },
          onFailure: function (errorCode, errorMessage) {
            reject(errorCode, errorMessage);
          },
        });
      });
      promise = makeCancelable(promise);
      promise.promise
                .then((albums) => dispatch(albumsChange(true, albums)))
                .catch((err) => console.log(err));  // TODO: add catch
      dispatch(setAlbumsPromise(promise));
    }
  };
}

export function loadArtists() {
  return (dispatch, getState) => {
    const { cefQuery, library } = getState();
    const { artistsLoaded } = library;
    if (!artistsLoaded) {
      dispatch(cleanArtists());
      let promise = new Promise((resolve, reject) => {
        cefQuery({
          request: 'SQL_LOAD_ARTISTS',
          onSuccess: function (response) {
            console.log(response);
            const data = JSON.parse(response);
            resolve(data);
          },
          onFailure: function (errorCode, errorMessage) {
            reject(errorCode, errorMessage);
          },
        });
      });
      promise = makeCancelable(promise);
      promise.promise
                .then((artists) => dispatch(artistsChange(true, artists)))
                .catch((err) => console.log(err));  // TODO: add catch
      dispatch(setArtistsPromise(promise));
    }
  };
}

export function loadGenres() {
  return (dispatch, getState) => {
    const { cefQuery, library } = getState();
    const { genresLoaded } = library;
    if (!genresLoaded) {
      dispatch(cleanGenres());
      let promise = new Promise((resolve, reject) => {
        cefQuery({
          request: 'SQL_LOAD_GENRES',
          onSuccess: function (response) {
            console.log(response);
            const data = JSON.parse(response);
            resolve(data);
          },
          onFailure: function (errorCode, errorMessage) {
            reject(errorCode, errorMessage);
          },
        });
      });
      promise = makeCancelable(promise);
      promise.promise
                .then((genres) => dispatch(genresChange(true, genres)))
                .catch((err) => console.log(err));  // TODO: add catch
      dispatch(setGenresPromise(promise));
    }
  };
}

export function addSongs() {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(setLoading(true));
    cefQuery({
      request: 'SQL_ADD_FILES',
      onSuccess: function (response) {
        console.log(response);
        dispatch(cleanLibrary());
        dispatch(setLoading(false));
      },
      onFailure: function (errorCode, errorMessage) {
        // catch error
      },
    });
  };
}
