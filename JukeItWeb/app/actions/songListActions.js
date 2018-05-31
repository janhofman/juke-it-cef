import { makeCancelable } from './../utils';

export function makeStatic() {
  return {
    type: 'SONGLIST_MAKE_STATIC',
  };
}

export function makeSelectable(playlistId) {
  return {
    type: 'SONGLIST_MAKE_SELECTABLE',
    payload: playlistId,
  };
}

export function closeOptions() {
  return {
    type: 'SONGLIST_CLOSE_OPTIONS',
  };
}

export function openOptions(target) {
  return {
    type: 'SONGLIST_OPEN_OPTIONS',
    payload: target,
  };
}

export function selectionChanged(selected) {
  return {
    type: 'SONGLIST_SELECTION_CHANGED',
    payload: selected,
  };
}

export function songsChange(loaded, songs) {
  return {
    type: 'SONGLIST_SONGS_CHANGE',
    payload: { songsLoaded: loaded, songs },
  };
}

export function setSongsPromise(songsPromise) {
  return {
    type: 'SONGLIST_SET_SONGS_PROMISE',
    payload: songsPromise,
  };
}

export function openContextMenu(target, songId) {
  return {
    type: 'SONGLIST_OPEN_CONTEXT_MENU',
    payload: { anchor: target, songId },
  };
}

export function closeContextMenu() {
  return {
    type: 'SONGLIST_CLOSE_CONTEXT_MENU',
  };
}

export function clearSongs() {
  return (dispatch, getState) => {
    const { songsPromise } = getState();
    if (songsPromise) {
      songsPromise.cancel();
    }
    dispatch(songsChange(false, []));
  };
}
export function metadataChange(loaded, title, subtitle) {
  return {
    type: 'SONGLIST_METADATA_CHANGE',
    payload: {
      metadataLoaded: loaded,
      title,
      subtitle,
    },
  };
}

export function setMetadataPromise(metadataPromise) {
  return {
    type: 'SONGLIST_SET_METADATA_PROMISE',
    payload: metadataPromise,
  };
}

export function clearMetadata() {
  return (dispatch, getState) => {
    const { metadataPromise } = getState();
    if (metadataPromise) {
      metadataPromise.cancel();
    }
    dispatch(metadataChange(false, null, null));
  };
}
export function clear() {
  return (dispatch) => {
    dispatch(clearSongs());
    dispatch(clearMetadata());
  };
}

export function loadSongsForPlaylist(playlistId) {
  return ((dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(clearSongs());
    let newPromise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_SONGVIEW?playlistId=${playlistId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          resolve(data);
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    newPromise = makeCancelable(newPromise);
    newPromise.promise
            .then((songs) => dispatch(songsChange(true, songs)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setSongsPromise(newPromise));
  });
}

export function loadMetadataForPlaylist(playlistId) {
  return ((dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(clearMetadata());
    let infoPromise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_LOAD_PLAYLISTS?id=${playlistId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          if (data.length > 0) {
            resolve(data[0]);
          } else {
            // TODO: make proper catch
            reject(100, 'no playlist matches query');
          }
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    infoPromise = makeCancelable(infoPromise);
    infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, info.description)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setMetadataPromise(infoPromise));
  });
}

export function loadSongsForGenre(genreId) {
  return ((dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(clearSongs());
    let newPromise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_SONGVIEW?genreId=${genreId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          resolve(data);
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    newPromise = makeCancelable(newPromise);
    newPromise.promise
            .then((songs) => dispatch(songsChange(true, songs)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setSongsPromise(newPromise));
  });
}

export function loadMetadataForGenre(genreId) {
  return ((dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(clearMetadata());
    let infoPromise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_LOAD_GENRES?id=${genreId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          if (data.length > 0) {
            resolve(data[0]);
          } else {
            // TODO: make proper catch
            reject(100, 'no genre matches query');
          }
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    infoPromise = makeCancelable(infoPromise);
    infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, null)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setMetadataPromise(infoPromise));
  });
}

export function loadSongsForArtist(artistId) {
  return ((dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(clearSongs());
    let newPromise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_SONGVIEW?artistId=${artistId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          resolve(data);
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    newPromise = makeCancelable(newPromise);
    newPromise.promise
            .then((songs) => dispatch(songsChange(true, songs)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setSongsPromise(newPromise));
  });
}

export function loadMetadataForArtist(artistId) {
  return ((dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(clearMetadata());
    let infoPromise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_LOAD_ARTISTS?id=${artistId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          if (data.length > 0) {
            resolve(data[0]);
          } else {
            // TODO: make proper catch
            reject(100, 'no album matches query');
          }
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    infoPromise = makeCancelable(infoPromise);
    infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, null)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setMetadataPromise(infoPromise));
  });
}

export function loadSongsForAlbum(albumId) {
  return ((dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(clearSongs());
    let newPromise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_SONGVIEW?albumId=${albumId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          resolve(data);
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    newPromise = makeCancelable(newPromise);
    newPromise.promise
            .then((songs) => dispatch(songsChange(true, songs)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setSongsPromise(newPromise));
  });
}

export function loadMetadataForAlbum(albumId) {
  return ((dispatch, getState) => {
    const { cefQuery } = getState();
    dispatch(clearMetadata());
    let infoPromise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_ALBUMVIEW?id=${albumId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          if (data.length > 0) {
            resolve(data[0]);
          } else {
            // TODO: make proper catch
            reject(100, 'no album matches query');
          }
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    infoPromise = makeCancelable(infoPromise);
    infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, info.artist)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setMetadataPromise(infoPromise));
  });
}

