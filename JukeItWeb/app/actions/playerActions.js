import * as fb from 'firebase';
import { nextSong } from './playbackActions';
import { makeCancelable } from '../utils';

export function play() {
  return (dispatch, getState) => {
    const { player, cefQuery } = getState();
    const { currentSong, playing } = player;
    if (!playing && currentSong) {
      const promise = new Promise((resolve, reject) => {
        cefQuery({
          request: 'PLAY_PLAY',
          onSuccess(response) {
            resolve(response);
          },
          onFailure(errorCode, errorMessage) {
            reject(errorCode, errorMessage);
          },
        });
      });
      promise.then(() => {
        dispatch({ type: 'PLAYER_PLAY' });
        // upload startedPlayingAt on firebase
        dispatch(startedPlaying());
      });
    }
  };
}

export function open(song) {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    const request = `PLAY_OPEN?path=${song.path}`; // sanitize path
    const promise = new Promise((resolve, reject) => {
      cefQuery({
        request,
        onSuccess(response) {
          console.log(response);
          resolve(response);
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    promise.then();
  };
}

export function stop() {
  return {
    type: 'PLAYER_STOP',
  };
}

export function setLength(length) {
  return ({
    type: 'PLAYER_SET_LENGTH',
    payload: length,
  });
}

export function pause() {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    const request = 'PLAY_PAUSE';
    const promise = new Promise((resolve, reject) => {
      cefQuery({
        request,
        onSuccess(response) {
          resolve(response);
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    });
    promise.then(() => dispatch({
      type: 'PLAYER_PAUSE',
    }));
  };
}

export function updateTime(value) {
  return ({
    type: 'PLAYER_UPDATE_TIME',
    payload: value,
  });
}

export function changeSong(song, key) {
  return ({
    type: 'PLAYER_SONG_CHANGE',
    payload: { song, key },
  });
}

export function stopPlayback() {
  return (dispatch) => {
    const audioElem = document.getElementById('audioElem');
    dispatch(pause());
    dispatch(stop());
  };
}

export function startedPlaying() {
  return (dispatch, getState) => {
    const { firebase, userData, player } = getState();
    const { spotId } = userData;
        // firebase.database().ref('.info/serverTimeOffset').once('value', (offset) => console.log("Offset: ", offset.val(), "Time: ", Date.now(), "Time + offset: ", Date.now() + offset.val()));
    firebase.database()
            .ref('que')
            .child(spotId)
            .child(player.queueKey)
            .update({ startedPlayingAt: fb.database.ServerValue.TIMESTAMP });
  };
}

export function seekTo(time) {
  return () => {
    const audioElem = document.getElementById('audioElem');
    audioElem.currentTime = time;
  };
}
