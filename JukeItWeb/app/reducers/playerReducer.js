const initialState = {
  currentSong: null,
  playing: false,
  currentTime: 0,
  length: -1,
  queueKey: null,
  onFinishAction: null,
  webSocket: null,
  initialized: false,
  playerConnected: false,
  volume: 100,
  webSocketManager: null,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'PLAYER_PLAY':
      return { ...state, playing: true };
    case 'PLAYER_PAUSE':
      return { ...state, playing: false };
    case 'PLAYER_UPDATE_TIME':
      return { ...state, currentTime: action.payload };
    case 'PLAYER_SET_LENGTH':
      return { ...state, length: action.payload };
    case 'PLAYER_SONG_CHANGE':
      return { ...state, currentSong: action.payload.song, queueKey: action.payload.key, currentTime: 0 };
    case 'PLAYER_STOP':
      return initialState;
    case 'PLAYER_VOLUME':
      return { ...state, volume: action.payload };
    case 'PLAYER_SET_ONFINISHACTION':
      return { ...state, onFinishAction: action.payload };    
    case 'PLAYER_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'PLAYER_SET_WEBSOCKET': {
      if (state.webSocket) {
        state.webSocket.close();
      }
      return { ...state, webSocket: action.payload, webSocketManager: action.payload ? {} : null, initialized: false };
    }
    case 'PLAYER_REGISTER_WEBSOCKET_CALLBACK': {
      if (state.webSocketManager) {
        const { id, onSuccess, onFailure } = action.payload;
        let manager = {...state.webSocketManager};
        manager[id] = { onSuccess, onFailure };
        return { ...state, webSocketManager: manager };
      }
      return { ...state };
    }
    case 'PLAYER_REMOVE_WEBSOCKET_CALLBACK': {
      if (state.webSocketManager) {
        const { id } = action.payload;        
        let manager = {...state.webSocketManager};
        delete manager[id];
        return { ...state, webSocketManager: manager };
      }
      return { ...state };
    }
    case 'PLAYER_RESET':
      return {
        ...state,
        currentSong: null,
        playing: false,
        currentTime: 0,
        length: -1,
        queueKey: null,
      };
    case 'PLAYER_CONNECTION':
      return { ...state, playerConnected: action.payload }
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
