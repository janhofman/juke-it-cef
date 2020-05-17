import { makeCancelable, EntityEnum } from './../utils';
import {
  getAllEntitySongs,
  apiGenrePromise,
  apiAlbumPromise,
  apiArtistPromise,
  apiPlaylistPromise,
  loadPlaylists,
} from './libraryActions';

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
  return (dispatch) => {
    dispatch(loadPlaylists());
    dispatch({
      type: 'SONGLIST_OPEN_OPTIONS',
      payload: target,
    });
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
  return (dispatch) => {
    dispatch(loadPlaylists());
    dispatch({
      type: 'SONGLIST_OPEN_CONTEXT_MENU',
      payload: { anchor: target, songId },
    });
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

function loadSongsForEntity(entity, entityId) {
  return ((dispatch, getState) => {
    const {
      devices: {
        fileServer: {
          baseAddress,
        },
      },
      userData: {
        userId,
      },
    } = getState();

    dispatch(clearSongs());
    let newPromise = getAllEntitySongs(baseAddress, entity, entityId, userId);
    newPromise = makeCancelable(newPromise);
    newPromise.promise
      .then((songs) => dispatch(songsChange(true, songs)))
      .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setSongsPromise(newPromise));
  });
}

export function loadSongsForPlaylist(playlistId) {
  /* return ((dispatch, getState) => {
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
  });*/
  return loadSongsForEntity(EntityEnum.PLAYLIST, playlistId);
}

export function loadMetadataForPlaylist(playlistId) {
  return ((dispatch, getState) => {
    const {
      devices: {
        fileServer: {
          baseAddress,
        },
      },
      userData: {
        userId,
      },
    } = getState();

    dispatch(clearMetadata());
    let infoPromise = apiPlaylistPromise(baseAddress, playlistId, userId);
    infoPromise = makeCancelable(infoPromise);
    infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, info.description)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setMetadataPromise(infoPromise));
  });
}

export function loadSongsForGenre(genreId) {
  return loadSongsForEntity(EntityEnum.GENRE, genreId);
}

export function loadMetadataForGenre(genreId) {
  return ((dispatch, getState) => {
    const {
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    dispatch(clearMetadata());
    let infoPromise = apiGenrePromise(baseAddress, genreId);
    infoPromise = makeCancelable(infoPromise);
    infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, null)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setMetadataPromise(infoPromise));
  });
}

export function loadSongsForArtist(artistId) {
  return loadSongsForEntity(EntityEnum.ARTIST, artistId);
}

export function loadMetadataForArtist(artistId) {
  return ((dispatch, getState) => {
    const {
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    dispatch(clearMetadata());
    let infoPromise = apiArtistPromise(baseAddress, artistId);
    infoPromise = makeCancelable(infoPromise);
    infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, null)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setMetadataPromise(infoPromise));
  });
}

export function loadSongsForAlbum(albumId) {
  return loadSongsForEntity(EntityEnum.ALBUM, albumId);
}

export function loadMetadataForAlbum(albumId) {
  return ((dispatch, getState) => {
    const {
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    dispatch(clearMetadata());
    let infoPromise = apiAlbumPromise(baseAddress, albumId);
    infoPromise = makeCancelable(infoPromise);
    infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, info.artist)))
            .catch((err) => console.log(err)); // TODO: add catch
    dispatch(setMetadataPromise(infoPromise));
  });
}

