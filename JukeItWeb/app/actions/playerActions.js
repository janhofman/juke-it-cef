import * as fb from 'firebase';
import { makeCancelable, sanitizeQueryParameter } from '../utils';

export function play() {
  return (dispatch, getState) => {
    const { player, cefQuery } = getState();
    const { currentSong } = player;
    if (currentSong) {
      cefQuery({
        request: 'PLAY_PLAY',
        onSuccess() {
          dispatch({type: 'PLAYER_PLAY'});
          // upload startedPlayingAt on firebase
          dispatch(startedPlaying());
        },
        onFailure(errorCode, errorMessage) {
          reject(errorCode, errorMessage);
        },
      });
    }
  };
}

export function open(song) {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    const request = `PLAY_OPEN?path=${sanitizeQueryParameter(song.path)}`; // sanitize path
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

export function registerTimeUpdateCallback() {
  return (dispatch, getState) => {
    const { cefQuery } = getState();
    const request = 'PLAY_TIME_UPDATE';
    cefQuery({
      request,
      persistent: true,
      onSuccess(response) {
        const data = JSON.parse(response);
        dispatch(updateTime(data.time));
      },
      onFailure(errorCode, errorMessage) {
        // catch here
      },
    });
  };
}

export function registerPlaybackFinishedCallback() {
  return (dispatch, getState) => {
    const { cefQuery, player } = getState();
    const request = 'PLAY_PLAYBACK_FINISHED';
    cefQuery({
      request,
      persistent: true,
      onSuccess() {
        if (player.onFinishAction) {
          dispatch(player.onFinishAction);
        }
      },
      onFailure(errorCode, errorMessage) {
        // catch here
      },
    });
  };
}

export function setOnFinishAction(onFinishAction) {
  return ({
    type: 'PLAYER_SET_ONFINISHACTION',
    payload: onFinishAction,
  });
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
