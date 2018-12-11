import axios from 'axios';
import {
  makeCancelable,
  buildQueryString,
} from './../utils';
import {
  getAllPlaylists,
} from './libraryActions';

export function showDialog(show) {
  return {
    type: 'PLAYLISTS_SHOW_DIALOG',
    payload: show,
  };
}

export function playlistsChange(loaded, playlists) {
  return {
    type: 'PLAYLISTS_CHANGE',
    payload: { playlists, playlistsLoaded: loaded },
  };
}

export function setPlaylistsPromise(promise) {
  return {
    type: 'PLAYLISTS_SET_PROMISE',
    payload: promise,
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

export function loadPlaylists() {
  return (dispatch, getState) => {
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
                .then((playlists) => dispatch(playlistsChange(true, playlists)))
                .catch((err) => console.log(err));  // TODO: add catch
      dispatch(setPlaylistsPromise(promise));
    }
  };
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
