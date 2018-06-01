import { push } from 'react-router-redux';
import { changeSong, stopPlayback } from './playerActions';

export function playlistChanged(playlist) {
  return {
    type: 'PLAYBACK_PLAYLIST_CHANGED',
    payload: playlist,
  };
}

export function toggleQueue() {
  return {
    type: 'PLAYBACK_TOGGLE_QUEUE',
  };
}

export function openContextMenu(target, songId) {
  return {
    type: 'PLAYBACK_OPEN_CONTEXT_MENU',
    payload: { anchor: target, songId },
  };
}

export function closeContextMenu() {
  return {
    type: 'PLAYBACK_CLOSE_CONTEXT_MENU',
  };
}

// we do not want to export this raw function, create wrappers around it instead
function uploadLibrary(entityKeyName, entityId, title, subtitle) {
  return (dispatch, getState) => {
    const { firebase, userData, cefQuery } = getState();
    const { spotId } = userData;
    let request = 'SQL_LOAD_LIBRARY';
    if (entityKeyName && entityId) {
      request += `?${entityKeyName}=${entityId}`;
    }
    const promise = new Promise((resolve, reject) => {
      cefQuery({
        request,
        onSuccess(response) {
          console.log(response);
          const data = JSON.parse(response);
          resolve(data);
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    }).then((lib) => {
      console.log(lib);
      const libRef = firebase.database().ref('libraries').child(spotId);
      const updates = {};
      updates.songs = [];
      for (let i = 0; i < lib.songs.length; i++) {
        const song = lib.songs[i];
        updates.songs[song.id] = {
          artistId: song.artistId ? song.artistId.toString() : null,
          genreId: song.genreId ? song.genreId.toString() : null,
          length: song.length,
          name: song.title,
        };
      }
      const artistMap = []; // maps artist's name to corresponding list
      updates.lists = {};
      updates.artists = [];
      const listsRef = libRef.child('lists');
      for (let i = 0; i < lib.artists.length; i++) {
        const song = lib.artists[i];
        let key;
        if (artistMap[song.artistName]) {
          // artist already present, set key
          key = artistMap[song.artistName];
        } else {
          // artist not present, get new key
          key = listsRef.push().key;
          artistMap[song.artistName] = key;
          updates.lists[key] = [];
          updates.artists[song.artistId] = {        // insert artist data
            name: song.artistName,
            songListId: key,
          };
        }
        updates.lists[key][song.songId] = true; // append to list
      }
      const genreMap = []; // maps genre's name to corresponding list
      updates.genres = [];
      for (let i = 0; i < lib.genres.length; i++) {
        const song = lib.genres[i];
        let key;
        if (genreMap[song.genreName]) {
          // genre already present, set key
          key = genreMap[song.genreName];
        } else {
          // genre not present, get new list key
          key = listsRef.push().key;
          genreMap[song.genreName] = key;
          updates.lists[key] = [];
          updates.genres[song.genreId] = {        // insert genre data
            name: song.genreName,
            songListId: key,
          };
        }
        updates.lists[key][song.songId] = true; // append to list
      }
      const albumMap = []; // maps album's id to corresponding list
      updates.albums = [];
      for (let i = 0; i < lib.albums.length; i++) {
        const song = lib.albums[i];
        let key;
        if (albumMap[song.albumId]) {
          // album already present, set key
          key = albumMap[song.albumId];
        } else {
          // album not present, get new key
          key = listsRef.push().key;
          albumMap[song.albumId] = key;
          updates.lists[key] = [];
          updates.albums[song.albumId] = {        // insert album data
            name: song.albumName,
            songListId: key,
          };
        }
        updates.lists[key][song.songId] = true; // append to list
      }

      console.log(updates);
      libRef.update(updates)
        .then(() => {
          const playlist = {
            title,
            subtitle,
            songs: lib.songs,
          };
          dispatch(playlistChanged(playlist));
          dispatch(push('/home/playback'));
        });
    });
  };
}

export function uploadGenreLib(genreId, title, subtitle) {
  return uploadLibrary('genreId', genreId, title, subtitle);
}

export function uploadPlaylistLib(playlistId, title, subtitle) {
  return uploadLibrary('playlistId', playlistId, title, subtitle);
}

export function uploadArtistLib(artistId, title, subtitle) {
  return uploadLibrary('artistId', artistId, title, subtitle);
}

export function uploadAlbumLib(albumId, title, subtitle) {
  return uploadLibrary('albumId', albumId, title, subtitle);
}

export function uploadSongsLib(title, subtitle) {
  return uploadLibrary(null, null, title, subtitle);
}

export function changePlaylist(title, subtitle, songs) {
  return (dispatch) => {
    // dispatch(uploadPlaylist(songs));
    // temporary solution
    dispatch(uploadSongsLib());
    const playlist = {
      title,
      subtitle,
      songs,
    };
    dispatch(playlistChanged(playlist));
    dispatch(push('/home/playback'));
  };
}

export function removePlaylist() {
  return (dispatch, getState) => {
    const { firebase, userData } = getState();
    firebase.database()
            .ref('libraries')
            .child(userData.spotId)
            .remove();
    dispatch(playlistChanged(null));
  };
}

export function queueUpdate(queue) {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    const operations = [];
    if (queue) {
      const keys = Object.keys(queue);
      keys.forEach((key) => {
        operations.push(new Promise((resolve, reject) => {
          cefQuery({
            request: `SQL_SONGVIEW?id=${queue[key].songId}`,
            onSuccess(response) {
              const data = JSON.parse(response);
              if (data.length > 0) {
                queue[key].name = data[0].title;
                resolve();
              } else {
                // TODO: data problem
                reject(100, 'data problem');
              }
            },
            onFailure(errorCode, errorMessage) {
              reject(errorCode, errorMessage);
            },
          });
        }));
      });
    }
    Promise.all(operations).then(
            () => dispatch({
              type: 'PLAYBACK_QUEUE_UPDATE',
              payload: queue,
            }));
  };
}

// function should only be called when logging out
export function wipeQueue() {
  return (dispatch, getState) => {
    const { firebase, userData } = getState();
    const { spotId } = userData;
        // remove data form firebase
    firebase.database().ref('que').child(spotId).remove();
  };
}

export function addToEndOfQueue(songId) {
  return (dispatch, getState) => {
    const { firebase, userData } = getState();
    const queRef = firebase.database().ref('que').child(userData.spotId);
    queRef.push({
      songId: songId.toString(),
      userId: userData.userId,
    });
  };
}

// should not be used outside of this actionCreator
export function addToEndOfQueueAndPlay(songId) {
  return (dispatch, getState) => {
    const { firebase, userData, cefQuery } = getState();
    const queRef = firebase.database().ref('que').child(userData.spotId);
    const key = queRef.push({
      songId: songId.toString(),
      userId: userData.userId,
    }).key;
    cefQuery({
      request: `SQL_SONGVIEW?id=${songId}`,
      onSuccess(response) {
        const data = JSON.parse(response);
        if (data.length > 0) {
          dispatch(changeSong(data[0], key));
        } else {
          // TODO: data problem
        }
      },
      onFailure(errorCode, errorMessage) {
        // TODO: catch
      },
    });
  };
}

export function removeTopOfQueue() {
  return (dispatch, getState) => {
    const { playback, firebase, userData } = getState();
    const { queue } = playback;
    const keys = Object.keys(queue);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const updates = {};
      updates[firstKey] = null;
      firebase.database()
                .ref('que')
                .child(userData.spotId)
                .update(updates);
      delete queue[firstKey];
      dispatch(queueUpdate(queue));
    }
  };
}

export function nextSong() {
  return (dispatch, getState) => {
    const { playback, cefQuery } = getState();
    const { activePlaylist, queue } = playback;
    const playlist = activePlaylist;
    const keys = queue ? Object.keys(queue) : null;
    if (keys && keys.length > 0) {
      // play from queue
      const key = keys[0];
      cefQuery({
        request: `SQL_SONGVIEW?id=${queue[key].songId}`,
        onSuccess(response) {
          const data = JSON.parse(response);
          if (data.length > 0) {
            dispatch(changeSong(data[0], key));
          } else {
            // TODO: data problem
          }
        },
        onFailure(errorCode, errorMessage) {
          // catch here
        },
      });
    } else if (playlist && playlist.songs.length > 0) {
                // play from playlist
      const rand = Math.floor(Math.random() * playlist.songs.length);
      dispatch(addToEndOfQueueAndPlay(playlist.songs[rand].id));
    } else {
                // stop playback
      dispatch(stopPlayback());
    }
  };
}

