import * as fb from 'firebase';
import { format, parse } from 'json-rpc-protocol';
import { playlistQueueAddItem, generateNextSong, playlistQueueRemoveItem, removeQueueItem } from './playbackActions';

function buildRequest(action, payload) {
  return format.request(Date.now(), action, payload);
}

function playRequest() {
  return buildRequest('PLAY');
}

function pauseRequest() {
  return buildRequest('PAUSE');
}

function nextRequest() {
  return buildRequest('NEXT');
}

function volumeRequest(volume) {
  return buildRequest('VOLUME', { volume });
}

function initializeRequest(url) {
  console.log('Initialize ',url );
  return buildRequest('INITIALIZE', { url });
}

function updateQueueRequest(queue) {
  return buildRequest('UPDATEQUEUE', { queue });
}

function addPlaylistRequest(songId, itemId) {
  const payload = {
    songId: songId.toString(),
    itemId: itemId.toString(),
  };
  return buildRequest('ADDPLAYLIST', payload);
}

function addOrderRequest(songId, itemId) {
  const payload = {
    songId: songId.toString(),
    itemId: itemId.toString(),
  };
  return buildRequest('ADDORDER', payload);
}

export function play() {
  return (dispatch, getState) => {
    const { player: { webSocket } } = getState();
    if (webSocket) {
      const request = playRequest();
      webSocket.send(request);
      dispatch({
        type: 'PLAYER_PLAY',
      });
    }
  };
}

export function stop() {
  return {
    type: 'PLAYER_STOP',
  };
}

function sendVolume(volume) {
  return (dispatch, getState) => {
    const { player: { webSocket } } = getState();
    console.log("websocket: ", webSocket);
    if (webSocket) {
      console.log("sending volume")      
      const request = volumeRequest(volume);
      webSocket.send(request);      
    }
  };
}

export function setVolume(newVolume){
  return (dispatch) => {
    dispatch(sendVolume(newVolume));
    dispatch({
      type: 'PLAYER_VOLUME',
      payload: newVolume,
    });
  };  
}

export function setLength(length) {
  return ({
    type: 'PLAYER_SET_LENGTH',
    payload: length,
  });
}

function playerConnectionChanged(connected) {
  return ({
    type: 'PLAYER_CONNECTION',
    payload: connected,
  });
}

export function pause() {
  return (dispatch, getState) => {
    const { player: { webSocket } } = getState();
    if (webSocket) {
      const request = pauseRequest();
      webSocket.send(request);
      dispatch({
        type: 'PLAYER_PAUSE',
      });
    }
  };
}

export function next() {
  return (dispatch, getState) => {
    const { player: { webSocket } } = getState();
    if (webSocket) {
      const request = nextRequest();
      webSocket.send(request);
    }
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

function playerReset() {
  return ({
    type: 'PLAYER_RESET',
  });
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

function handleError(payload) {
  return (dispatch, getState) => {
    if (payload.errorCode) {
      switch (payload.errorCode) {
        case 21: {
          // empty queues
          dispatch(requestPlaylist());
          const { player: { playing } } = getState();
          if (playing) {
            dispatch(play());
          }
          break;
        }
        default:
          break;
      }
    }
  };
}

export function updateQueue(queue) {
  return (dispatch, getState) => {
    const {
      player: { webSocket },
    } = getState();
    if (webSocket) {
      const request = updateQueueRequest(queue);
      webSocket.send(request);
    }
  };
}

function setWebsocket(webSocket) {
  return ({
    type: 'PLAYER_SET_WEBSOCKET',
    payload: webSocket,
  });
}

function requestPlaylist() {
  return (dispatch, getState) => {
    const {
      playback: { activePlaylist },
      player: { webSocket },
    } = getState();
    const nextSong = generateNextSong(activePlaylist);
    if (nextSong) {
      const { songId, itemId } = nextSong;
      dispatch(playlistQueueAddItem(songId, itemId));
      //const request = addPlaylistRequest(songId, itemId);
      //webSocket.send(request);
    }
  };
}

function songStarted(payload) {
  return (dispatch, getState) => {
    if (payload.itemId) {
      // assume it is playing from queue when it's nonempty
      const { itemId } = payload;
      const { 
        playback: { 
          orderQueue,
          playlistQueue,
          priorityQueue,
          activePlaylist: { 
            map
          }
        },
      } = getState();

      let queue = priorityQueue.concat(orderQueue).concat(playlistQueue);
      for(let i in queue){
        if (queue[i].itemId === itemId) {
          dispatch(removeQueueItem(itemId));        
          dispatch(changeSong(map[queue[i].songId], itemId));
          break;
        }
      }
    }
  };
}

export function resetPlayer() {
  return (dispatch, getState) => {
    const {
      player: {
        playerConnected,
        webSocket,
      },
    } = getState();

    if (playerConnected) {
      if (webSocket) {
        const request = {
          action: 'RESET',
        };
        webSocket.send(request);
        dispatch(playerReset());
      } else {
        // TODO: log websocket missing error
      }
    }
  };
}

function statusUpdate(status) {
  return (dispatch, getState) => {
    if (status) {
      if ("playing" in status) {
        const {
          player: {
            playing,
          },
        } = getState();  

        if(status.playing !== playing){  
          if (status.playing) {
            dispatch({
              type: 'PLAYER_PLAY',
            });
          } else {
            dispatch({
              type: 'PLAYER_PAUSE',
            });
          }
        }
      };

      if ("timestamp" in status) {
        dispatch(updateTime(status.timestamp));
      }
    }
  }
}

function webSocketOnMessage(dispatch, event) {
  try {
    const msg = parse(event.data);
    if (msg.type === 'notification') {
      switch (msg.method) {
        case 'REQUESTPLAYLIST': {
          dispatch(requestPlaylist());
          break;
        }
        default: {
          // actions with payload are resolved here
          if (msg.params) {
            switch (msg.method) {
              case 'ERROR': {
                console.log(msg.params);
                dispatch(handleError(msg.params));
                break;
              }
              case 'SONGSTARTED': {
                dispatch(songStarted(msg.params));
                break;
              }
              case 'STATUS': {
                dispatch(statusUpdate(msg.params));
                break;
              }
              default:
                // throw away
                break;
            }
          }
        }
      }
    }
  } catch (ex) {
    // TODO: mark bad format
    console.log(ex);
  }
}

function testHostame(hostname, dispatch) {
  const rtc = true;

  return rtc;
}

function testPortNumber(portNumber, dispatch) {
  const rtc = true;

  return rtc;
}

export function connectToLocalPlayer() {
  return (dispatch, getState) => {
    const {
      devices: {
        player: {
          local: {
            hostname,
            port,
          },
        },
      },
    } = getState();

    if (testHostame(hostname) && testPortNumber(port)) {
      let url = 'ws://';
      if (hostname.toLowerCase().startsWith('ws://')) {
        url = hostname;
      } else {
        url += hostname;
      }
      url += `:${port}`;
      dispatch(connect(url));
    }
  };
}

export function connectToRemotePlayer() {
  return (dispatch, getState) => {
    const {
      devices: {
        player: {
          remote: {
            hostname,
            port,
          },
        },
      },
    } = getState();

    if (testHostame(hostname) && testPortNumber(port)) {
      let url = 'ws://';
      if (hostname.toLowerCase().startsWith('ws://')) {
        url = hostname;
      } else {
        url += hostname;
      }
      url += `:${port}`;
      dispatch(connect(url));
    }
  };
}

function connect(address) {
  return (dispatch, getState) => {
    const {
      devices: {
        fileServer: {
          baseAddress,
        },
      },
      player: {
        volume,
      }
    } = getState();

    if (address) {
      try {
        const ws = new WebSocket(address);
        ws.onmessage = (event) => webSocketOnMessage(dispatch, event);
        ws.onopen = () => {
          dispatch(playerConnectionChanged(true));
          const init = initializeRequest(baseAddress);
          ws.send(init);
          sendVolume(volume);
        };
        ws.onclose = () => {
          dispatch(playerConnectionChanged(false));
          dispatch(setWebsocket(null));
          dispatch(playerReset());
        };
        dispatch(setWebsocket(ws));
      } catch (ex) {
        console.log('Connection failed: ', ex);
        dispatch(playerConnectionChanged(false));
        dispatch(setWebsocket(null));
      }
    }
  };
}

export function disconnect() {
  return (dispatch, getState) => {
    const {
      player: {
        playerConnected,
        webSocket,
      },
    } = getState();

    if (playerConnected) {
      if (webSocket) {
        // just close websocket, onclose event should handle the rest
        webSocket.close();
      } else {
        // TODO: this should not be a good state
      }
    }
  };
}
