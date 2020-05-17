import * as fb from 'firebase';
import { format, parse } from 'json-rpc-protocol';
import { defineMessages } from 'react-intl';
import { maintainPlaylistQueue, removeQueueItem } from './playbackActions';
import { checkFsConnection } from './devicesActions';
import { notify } from './evenLogActions';
import { intl } from '../utils/IntlGlobalProvider';

const intlStrings = defineMessages({
  onWebSocketError: {
    id: 'playerActions.onWebSocketError',
    defaultMessage: 'Could not connect to player!',
  },
  onSongFailed: {
    id: 'playerActions.onSongFailed',
    defaultMessage: 'Song \'{title}\' could not be played!',
  },
  onUnknownSongFailed: {
    id: 'playerActions.onUnknownSongFailed',
    defaultMessage: 'A song failed to load!',
  },
  onFileserverDisconnected: {
    id: 'playerActions.onFileserverDisconnected',
    defaultMessage: 'Player has disconnected from fileserver! The playback has been stopped.',
  },
  onInitFailed: {
    id: 'playerActions.onInitFailed',
    defaultMessage: 'Player could not connect to fileserver!',
  },
  onFsNotConnected: {
    id: 'playerActions.onFsNotConnected',
    defaultMessage: 'Fileserver is not connected!',
  }
});

/*** BUILDING PLAYER REQUESTS ***/

function generateRequestId() {
  return `rqst${new Date().valueOf().toString(36)}${Math.random().toString(36).substr(2)}`;
}

function buildRequest(action, payload) {
  return format.request(generateRequestId(), action, payload);
}

function playRequest() {
  return buildRequest('PLAY');
}

function resetRequest() {
  return buildRequest('RESET');
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
  return buildRequest('INITIALIZE', { url });
}

function updateQueueRequest(queue) {
  return buildRequest('UPDATEQUEUE', { queue });
}

/*** PLAYER ACTIONS ***/

export function play() {
  return (dispatch, getState) => {
    const {
      player: {
        playerConnected,
        webSocket,
      },
    } = getState();

    if (playerConnected) {
      if (webSocket) {
        const request = playRequest();
        
        const onSuccess = () => {
          dispatch({
            type: 'PLAYER_PLAY',
          });
        }

        const onFailure = (error) => {
          // TODO: notify
          console.log(error);
        }

        dispatch(webSocketRequest(request, onSuccess, onFailure));
      } else {
        // TODO: log websocket missing error
      }
    }
  };
}

export function setVolume(newVolume){
  return (dispatch, getState) => {
    const {
      player: {
        playerConnected,
        webSocket,
      },
    } = getState();

    if (playerConnected) {
      if (webSocket) {
        const request = volumeRequest(newVolume);
        
        const onSuccess = () => {
          dispatch({
            type: 'PLAYER_VOLUME',
            payload: newVolume,
          });
        }

        const onFailure = (error) => {
          // TODO: notify
          console.log(error);
        }

        dispatch(webSocketRequest(request, onSuccess, onFailure));
      } else {
        // TODO: log websocket missing error
      }
    }
  };
}

export function setLength(length) {
  return ({
    type: 'PLAYER_SET_LENGTH',
    payload: length,
  });
}

export function playerInitialized(result) {
  return ({
    type: 'PLAYER_INITIALIZED',
    payload: result,
  });
}

export function pause() {
  return (dispatch, getState) => {
    const {
      player: {
        initialized,
        webSocket,
      },
    } = getState();

    if (webSocket) {
      if (initialized) {
        const request = pauseRequest();
        
        const onSuccess = () => {
          dispatch({
            type: 'PLAYER_PAUSE',
          });
        }

        const onFailure = (error) => {
          // TODO: notify
          console.log(error);
        }

        dispatch(webSocketRequest(request, onSuccess, onFailure));
      } else {
        // TODO: log websocket missing error
      }
    }
  };
}

export function next() {
  return (dispatch, getState) => {
    const {
      player: {
        initialized,
        webSocket,
      },
    } = getState();

    if (webSocket) {
      if (initialized) {
        const request = nextRequest();
        
        const onSuccess = () => {};

        const onFailure = (error) => {
          // TODO: notify
          console.log(error);
        }

        dispatch(webSocketRequest(request, onSuccess, onFailure));
      } else {
        // TODO: log websocket missing error
      }
    }
  };
}

export function initializePlayer() {
  return (dispatch, getState) => new Promise((resolve, reject) => {
    const {
      devices: {
        fileServer: {
          baseAddress: fsAddress,
        },
      },
      player: {
        initialized,
        webSocket,
        volume,
      },
    } = getState();

    if (webSocket) {
      if (!initialized) {
        const request = initializeRequest(fsAddress);

        const onSuccess = () => {
          dispatch(setVolume(volume));
          dispatch(playerInitialized(true));
          resolve();
        };

        const onFailure = (error) => {
          console.log("Init error", error);
          dispatch(playerInitialized(false));
          if(error.code === 55) {
            // player could not connect to fileserver
            dispatch(notify(intl.formatMessage(intlStrings.onInitFailed)));
            dispatch(checkFsConnection())
              .catch(() => {
                dispatch(notify(intl.formatMessage(intlStrings.onFsNotConnected)));
              });
          }
          reject(error);
        };

        dispatch(webSocketRequest(request, onSuccess, onFailure));
      } else {
        // TODO: log already initialized
        reject({ message: 'already initialized'});
      }
    } else {
      // TODO: log websocket missing error
      reject({ message: 'websocket missing'});
    }
  });  
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

/*
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
*/

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
          dispatch(maintainPlaylistQueue());
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
  return (dispatch, getState) => {
    const {
      player: {
        webSocket: oldWebSocket,
      }
    } = getState();

    if (oldWebSocket) {
      oldWebSocket.close();
    }  
    dispatch({
      type: 'PLAYER_SET_WEBSOCKET',
      payload: webSocket,
    });
  }
}

function createWebSocketCallback(id, onSuccess, onFailure) {
  return ({
    type: 'PLAYER_REGISTER_WEBSOCKET_CALLBACK',
    payload: {
      id,
      onSuccess,
      onFailure,
    }
  });
}

function removeWebSocketCallback(id) {
  return ({
    type: 'PLAYER_REMOVE_WEBSOCKET_CALLBACK',
    payload: {
      id,
    }
  });
}

function webSocketRequest(request, onSuccess, onFailure) {
  return (dispatch, getState) => {
    const {
      player: { webSocket, webSocketManager },
    } = getState();

    if(webSocket && webSocketManager) {
      var msg = parse(request);
      const id = msg.id;

      dispatch(createWebSocketCallback(id, onSuccess, onFailure));
      webSocket.send(request);
    }
  }
}

function webSocketResponse(msg) {
  return (dispatch, getState) => {
    const {
      player: { webSocketManager },
    } = getState();

    if(webSocketManager) {
      const id = msg.id;

      if(webSocketManager[id]) {
        const callbacks = webSocketManager[id];
        if(msg.type === 'response') {
          callbacks.onSuccess(msg.result);
        } else if (msg.type === 'error') {          
          callbacks.onFailure(msg.error);
        }
        dispatch(removeWebSocketCallback(id));
      }
    }
  }
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
        initialized,
        webSocket,
      },
    } = getState();

    if (webSocket) {
      if (initialized) {
        const request = resetRequest();
        
        const onSuccess = () => {
          dispatch(playerReset());
          dispatch(playerInitialized(false));
        }

        const onFailure = (error) => {
          console.log(error);
        }

        dispatch(webSocketRequest(request, onSuccess, onFailure));
      } else {
        dispatch(playerReset());
        dispatch(playerInitialized(false));
      }
    } else{
      dispatch(playerReset());
      dispatch(playerInitialized(false));
    }
  };
}

function handleSongFailed(itemId, songId) {
  return (dispatch, getState) => {
    if (itemId) {
      // assume it is playing from queue when it's nonempty      
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
          // get song
          const song = map[songId];
          if(song) {
            dispatch(notify(intl.formatMessage(intlStrings.onSongFailed, { title: song.title }))); 
          } else {
            dispatch(notify(intl.formatMessage(intlStrings.onUnknownSongFailed)));
          }
          break;
        }
      }
    }
  }
}

function handleFileserverDisconnected() {
  return (dispatch) => {
    dispatch(playerReset());
    dispatch(playerInitialized(false));
    dispatch(notify(intl.formatMessage(intlStrings.onFileserverDisconnected)));
    dispatch(checkFsConnection());
  }
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
    console.log('Message received: ', msg);
    if (msg.type === 'notification') {
      switch (msg.method) {
        case 'REQUESTPLAYLIST': {
          dispatch(maintainPlaylistQueue());
          break;
        }
        case 'FILESERVERDISCONNECTED': {
          console.log('FILESERVERDISCONNECTED message received.');
          dispatch(handleFileserverDisconnected());
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
              case 'SONGFAILED': {
                console.log('SONGFAILED message received with params: ', msg.params);
                const { songId, itemId } = msg.params;
                dispatch(handleSongFailed(itemId, songId));
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
    } else if(msg.type === 'response' || msg.type === 'error') {
      dispatch(webSocketResponse(msg));
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
  return (dispatch, getState) => new Promise(function (resolve, reject) {
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

      dispatch(connect(url, true))
        .then(() => resolve())
        .catch((error) => reject(error));
    } else{
      resolve();
    }
  });
}     

export function connectToRemotePlayer() {
  return (dispatch, getState) => new Promise(function(resolve, reject) {
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
      dispatch(connect(url, false))
      .then(() => resolve())
      .catch((error) => reject(error));
    } else{
      resolve();
    }
  });
}

function playerLocalConnected(address) {
  return {
    type: 'PLAYER_LOCAL_CONNECTED',
    payload: address
  };
}

function playerRemoteConnected(address) {
  return {
    type: 'PLAYER_REMOTE_CONNECTED',
    payload: address
  };
}

function playerDisconnected() {
  return {
    type: 'PLAYER_DISCONNECTED'
  };
}

function connect(address, local) {
  return (dispatch) => new Promise(function (resolve, reject) {
    if (address) {
      try {
        const ws = new WebSocket(address);
        ws.onmessage = (event) => webSocketOnMessage(dispatch, event);
        ws.onopen = () => {
          if(local) {
            dispatch(playerLocalConnected(address));      
          } else {
            dispatch(playerRemoteConnected(address));
          }              
        };
        ws.onclose = () => {
          dispatch(playerDisconnected());
          dispatch(setWebsocket(null));
          dispatch(playerReset());
        };
        ws.onerror = (event) => {
          if(event.target.readyState === 3) { // The connection is closed or couldn't be opened.
            dispatch(notify(intl.formatMessage(intlStrings.onWebSocketError)));
          }
        }
        dispatch(setWebsocket(ws));
        resolve()
      } catch (ex) {
        console.log('Connection failed: ', ex);
        dispatch(playerDisconnected());
        dispatch(setWebsocket(null));
        reject(ex);
      }
    } else {
      console.log('Connect failed, address: ', address);
      reject(); // fileserver not connected
    }
  });
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
