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

function uploadLibrary(entityKeyName, entityId){
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
        onSuccess: function (response) {
          console.log(response);
          const data = JSON.parse(response);
          resolve(data);
        },
        onFailure: function (errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    }).then((lib) => {
      console.log(lib);
      const libRef = firebase.database().ref('libraries').child(spotId);
      const updates = {};
      updates.songs = [];
      for (var i = 0; i < lib.songs.length; i++) {
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
      for (var i = 0; i < lib.artists.length; i++) {
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
      for (var i = 0; i < lib.genres.length; i++) {
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
      for (var i = 0; i < lib.albums.length; i++) {
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
      libRef.update(updates);
      /* .then(() => {
          dispatch(loadSongs(sqlite));
          dispatch(setLoading(false));
      }); */
    });
  };
}

export function uploadGenreLib(genreId) {
  return uploadLibrary('genreId', genreId);
}

export function uploadPlaylistLib(playlistId) {
  return uploadLibrary('playlistId', playlistId);
}

export function uploadArtistLib(artistId) {
  return uploadLibrary('artistId', artistId);
}

export function uploadAlbumLib(albumId) {
  return uploadLibrary('albumId', albumId);
}

export function uploadSongsLib() {
  return uploadLibrary();
}

export function uploadPlaylist(songs) {
  return (dispatch, getState) => {
    const { firebase, userData, sqlite } = getState();
    const { spotId } = userData;
        // get IDs of all songs
    const ids = [];
    songs.forEach((song) => ids.push(song.id), this);
    let comma = false;
    let sql = 'SELECT * FROM song WHERE id IN (';
    ids.forEach((id) => {
      if (comma) {
        sql += ',';
      }
      sql += id.toString();
      comma = true;
    }, this);
    sql += ')';
    console.log(sql);
    const library = []; // [songs, artists, genres, albums]
    library.push(new Promise((resolve, reject) => {
      sqlite.all(sql,
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            });
    }));
    library.push(new Promise((resolve, reject) => {
      sqlite.all(`SELECT artist.name AS artistName, artist.id AS artistId, song.id AS songId FROM artist INNER JOIN (${sql}) AS song ON artist.id = song.artistId`,
            // {1: sql},
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            });
    }));
    library.push(new Promise((resolve, reject) => {
      sqlite.all(`SELECT g.name AS genreName, g.id AS genreId, s.id AS songId FROM genre AS g INNER JOIN (${sql}) AS s ON (s.genreId = g.id)`,
            // {1: sql},
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            });
    }));
    library.push(new Promise((resolve, reject) => {
      sqlite.all(`SELECT a.name AS albumName, a.id AS albumId, s.id AS songId FROM album AS a INNER JOIN (${sql}) AS s ON (s.albumId = a.id)`,
            // {1: sql},
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            });
    }));
    Promise.all(library).then((lib) => {
      console.log(lib);
      const libRef = firebase.database().ref('libraries').child(spotId);
      const updates = {};
      updates.songs = [];
      for (var i = 0; i < lib[0].length; i++) {
        const song = lib[0][i];
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
      for (var i = 0; i < lib[1].length; i++) {
        const song = lib[1][i];
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
      for (var i = 0; i < lib[2].length; i++) {
        const song = lib[2][i];
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
      for (var i = 0; i < lib[3].length; i++) {
        const song = lib[3][i];
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
      libRef.update(updates);
                /* .then(() => {
                    dispatch(loadSongs(sqlite));
                    dispatch(setLoading(false));
                }); */
    });
  };
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
            request: `SQL_SONGVIEW_BY_ID?id=${queue[key].songId}`,
            onSuccess: function (response) {
              console.log(response);
              const data = JSON.parse(response);
              queue[key].name = data.title;
              resolve();
            },
            onFailure: function (errorCode, errorMessage) {
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
    const promise = new Promise((resolve, reject) => {
      cefQuery({
        request: `SQL_SONGVIEW_BY_ID?id=${songId}`,
        onSuccess: function (response) {
          const data = JSON.parse(response);
          resolve(data);
        },
        onFailure: function (errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    }).then((song) => {
      dispatch(changeSong(song, key));
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
      const promise = new Promise((resolve, reject) => {
        cefQuery({
          request: `SQL_SONGVIEW_BY_ID?id=${queue[key].songId}`,
          onSuccess: function (response) {
            const data = JSON.parse(response);
            resolve(data);
          },
          onFailure: function (errorCode, errorMessage) {
            reject(errorCode, errorMessage);
          },
        });
      }).then((song) => {
        dispatch(changeSong(song, key));
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

