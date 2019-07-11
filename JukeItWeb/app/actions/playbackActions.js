import { push } from 'react-router-redux';
import { addOrder, resetPlayer, play } from './playerActions';
import {
  apiSongPromise,
  getAllEntitySongs,
  getAllSongs,
} from './libraryActions';
import { EntityEnum } from './../utils';

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

export function resetPlaylistQueue() {
  return {
    type: 'PLAYBACK_RESET_PLAYLIST_QUEUE',
  };
}

export function toggleAvailableSongs() {
  return {
    type: 'PLAYBACK_TOGGLE_AVAILABLE_SONGS',
  };
}

export function togglePlaylistQueue() {
  return {
    type: 'PLAYBACK_TOGGLE_PLAYLIST_QUEUE',
  };
}

export function togglePriorityQueue() {
  return {
    type: 'PLAYBACK_TOGGLE_PRIORITY_QUEUE',
  };
}

export function toggleOrderQueue() {
  return {
    type: 'PLAYBACK_TOGGLE_ORDER_QUEUE',
  };
}

/**
 * Uploads library to firebase for users to browse.
 *
 * @param {EntityEnum} entityType - Type of entity to be uploaded. Null stands for all songs.
 * @param {string}     entityId   - ID of entity to be uploaded.
 * @param {string}     title      - Title to display on playback screen.
 * @param {string}     subtitle   - Subtitle to describe on playback screen.
 * @returns {function} dispatchable function.
 */
function uploadLibrary(entityType, entityId, title, subtitle) {
  return (dispatch, getState) => {
    const {
      firebase,
      userData: {
        userId,
        spotId,
      },
      devices: {
        fileServer: {
          baseAddress,
        },
      },
    } = getState();

    let promise;
    if (entityType) {
      promise = getAllEntitySongs(baseAddress, entityType, entityId, userId);
    } else {
      // null emtityType means we want all songs
      promise = getAllSongs(baseAddress);
    }
    promise.then((songs) => {
      const libRef = firebase.database().ref('libraries').child(spotId);
      const listsRef = libRef.child('lists');
      const updates = {
        songs: [],
        lists: {},
        artists: [],
        genres: [],
        albums: [],
      };
      const artistMap = []; // maps artist's name to corresponding list
      const genreMap = []; // maps genre's name to corresponding list
      const albumMap = []; // maps album's id to corresponding list


      for (let i = 0; i < songs.length; i++) {
        const song = songs[i];

        // first fill song object
        updates.songs[song.id] = {
          artistId: song.artistId ? song.artistId.toString() : null,
          genreId: song.genreId ? song.genreId.toString() : null,
          length: song.duration ? song.duration : null,
          name: song.title ? song.title : null,
        };

        // find and fill artist info
        if (song.artistId) {
          const { artistId } = song;
          let key;
          if (artistMap[artistId]) {
            // artist already present, set key
            key = artistMap[artistId];
          } else {
            // artist not present, get new key
            key = listsRef.push().key;
            artistMap[song.artistId] = key;
            updates.lists[key] = [];
            updates.artists[artistId] = {        // insert artist data
              name: song.artist,
              songListId: key,
            };
          }
          updates.lists[key][song.id] = true; // append to list
        }

        // find and fill genre info
        if (song.genreId) {
          const { genreId } = song;
          let key;
          if (genreMap[genreId]) {
            // genre already present, set key
            key = genreMap[genreId];
          } else {
            // genre not present, get new list key
            key = listsRef.push().key;
            genreMap[genreId] = key;
            updates.lists[key] = [];
            updates.genres[genreId] = {        // insert genre data
              name: song.genre,
              songListId: key,
            };
          }
          updates.lists[key][song.id] = true; // append to list
        }

        // find and fill album info
        if (song.albumId) {
          const { albumId } = song;
          let key;
          if (albumMap[albumId]) {
            // album already present, set key
            key = albumMap[albumId];
          } else {
            // album not present, get new key
            key = listsRef.push().key;
            albumMap[albumId] = key;
            updates.lists[key] = [];
            updates.albums[albumId] = {        // insert album data
              name: song.album,
              songListId: key,
            };
          }
          updates.lists[key][song.id] = true; // append to list
        }
      }

      // create map for playlist
      let map = {};
      for(let i in songs){
        map[songs[i].id] = songs[i];
      }

      console.log(updates);
      libRef.update(updates)
        .then(() => {
          const playlist = {
            title,
            subtitle,
            songs,
            map,
          };
          dispatch(playlistChanged(playlist));
          dispatch(push('/home/playback'));
        });
    });
  };
}

export function uploadGenreLib(genreId, title, subtitle) {
  return uploadLibrary(EntityEnum.GENRE, genreId, title, subtitle);
}

export function uploadPlaylistLib(playlistId, title, subtitle) {
  return uploadLibrary(EntityEnum.PLAYLIST, playlistId, title, subtitle);
}

export function uploadArtistLib(artistId, title, subtitle) {
  return uploadLibrary(EntityEnum.ARTIST, artistId, title, subtitle);
}

export function uploadAlbumLib(albumId, title, subtitle) {
  return uploadLibrary(EntityEnum.ALBUM, albumId, title, subtitle);
}

export function uploadSongsLib(title, subtitle) {
  return uploadLibrary(null, null, title, subtitle);
}

export function startPlayback(){
  return (dispatch, getState) => {
    dispatch({
      type: 'PLAYBACK_START',
    });
    dispatch(play());
  };
}

export function removePlaylist() {
  return (dispatch, getState) => {
    const { firebase, userData } = getState();

    // first remove it from firebase
    firebase.database()
            .ref('libraries')
            .child(userData.spotId)
            .remove();
    // reset player next
    dispatch(resetPlayer());
    // we reset the player, so playlistQueue has to be cleared too
    dispatch(resetPlaylistQueue());
    // since there is no playlist, we should wipe queue too
    dispatch(wipeQueue());
    dispatch(playlistChanged(null));
  };
}

// function should only be called when logging out
export function wipeQueue() {
  return (dispatch, getState) => {
    const {
      firebase,
      userData: {
        spotId,
      },
    } = getState();
    // remove data form firebase
    firebase.database().ref('que').child(spotId).remove();
  };
}

function generateItemId() {
  return `p${new Date().valueOf().toString(36)}${Math.random().toString(36).substr(2)}`;
}

export function generateNextSong(playlist) {
  if (playlist && playlist.songs.length > 0) {
    const rand = Math.floor(Math.random() * playlist.songs.length);
    const songId = playlist.songs[rand].id;
    // generate unique ID for this song
    const itemId = generateItemId();
    return ({
      songId,
      itemId,
    });
  }
  return null;
}

export function orderQueueChildAdded(itemId, queueItem) {
  return (dispatch) => {
    const { songId } = queueItem;
    dispatch({
      type: 'PLAYBACK_ORDERQUEUE_NEW_VALUE',
      payload: {
        itemId,
        songId,
      },
    });
  };
}

export function orderQueueChildRemoved(itemId) {
  return ({
    type: 'PLAYBACK_ORDERQUEUE_REMOVE_VALUE',
    payload: { itemId },
  });
}

export function priorityQueueAddItem(songId) {
  return ({
    type: 'PLAYBACK_PRIORITY_QUEUE_ADD',
    payload: {
      songId,
      itemId: generateItemId(),
    },
  });
}

export function playlistQueueAddItem(songId) {
  return ({
    type: 'PLAYBACK_PLAYLIST_QUEUE_ADD',
    payload: {
      songId,
      itemId: generateItemId(),
    },
  });
}


function removeFromOrderQueue(itemId) {
  return (dispatch, getState) => {
    const {
      firebase,
      userData: {
        spotId,
      },
    } = getState();
    // remove data form firebase
    console.log('removing from order queue');
    firebase.database().ref('que').child(spotId).child(itemId).remove();
  };
}

export function removeQueueItem(itemId) {
  return (dispatch, getState) => {
    const {
      playback: {
        orderQueue
      },
    } = getState();

    console.log("checking order queue")
    for(let i in orderQueue){
      if(orderQueue[i].itemId == itemId){
        // remove from firebase queue
        console.log('calling remove from order queue')
        dispatch(removeFromOrderQueue(itemId))
        return;
      }
    }
    dispatch({
      type: 'PLAYBACK_REMOVE_QUEUE_ITEM',
      payload: { itemId },
    });
  }
}
