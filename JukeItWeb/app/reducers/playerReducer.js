const initialState = {
  currentSong: null,
  playing: false,
  currentTime: 0,
  length: -1,
  queueKey: null,
  onFinishAction: null,
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
    case 'PLAYER_SET_ONFINISHACTION':
      return { ...state, onFinishAction: action.payload };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
