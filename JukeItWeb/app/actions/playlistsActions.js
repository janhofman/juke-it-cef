import {
  makeCancelable,
  sanitizeQueryParameter,
  buildQueryString,
} from './../utils';

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
    const { cefQuery, playlists, userData } = getState();
    const { playlistsLoaded } = playlists;
    const { userId } = userData;
    if (!playlistsLoaded) {
      dispatch(cleanPlaylists());
      let promise = new Promise((resolve, reject) => {
        cefQuery({
          request: `SQL_LOAD_PLAYLISTS?usr=${sanitizeQueryParameter(userId)}`,
          onSuccess(response) {
            const data = JSON.parse(response);
            resolve(data);
          },
          onFailure(errorCode, errorMessage) {
            reject(errorCode, errorMessage);
          },
        });
      });
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
    const { cefQuery, userData } = getState();
    const { userId } = userData;
    const params = { name, description, usr: userId };
    const query = buildQueryString(params)
    cefQuery({
      request: `SQL_ADD_PLAYLIST${query}`,
      onSuccess(response) {
        //const data = JSON.parse(response);
        dispatch(cleanPlaylists());
        dispatch(loadPlaylists());
        dispatch(showDialog(false));
      },
      onFailure(errorCode, errorMessage) {
        // TODO: catch
        console.log(errorCode, errorMessage);
      },
    });
  };
}

export function addSongsToPlaylist(playlistId, songs) {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    let songStr = '';
    let first = true;
    for (let i = 0; i < songs.length; i++) {
      if (first) {
        first = false;
      } else {
        songStr += ',';
      }
      songStr += songs[i];
    }
    const params = { playlistId, songs: songStr };
    cefQuery({
      request: `SQL_ADD_TO_PLAYLIST${buildQueryString(params)}`,
      onSuccess(response) {
        //const data = JSON.parse(response);
        dispatch(cleanPlaylists());
      },
      onFailure(errorCode, errorMessage) {
        // TODO: catch
        console.log(errorCode, errorMessage);
      },
    });
  };
}
