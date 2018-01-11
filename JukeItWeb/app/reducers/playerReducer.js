const initialState = {
    currentSong: null,
    playing: false,
    audioContext: null,
    currentTime: 0,
    length: -1,
    queueKey: null,
}

export default function reducer(state=initialState, action){
    switch(action.type){
        case 'PLAYER_PLAY':
            return {...state, playing: true};
        case 'PLAYER_CREATED_CONTEXT':
            return {...state, audioContext:action.payload};
        case 'PLAYER_PAUSE':
            return {...state, playing: false};
        case 'PLAYER_UPDATE_TIME':
            return {...state, currentTime: action.payload};
        case 'PLAYER_SET_LENGTH':
            return {...state, length: action.payload};
        case 'PLAYER_SONG_CHANGE':
            return {...state, currentSong: action.payload.song, queueKey: action.payload.key};
        case 'PLAYER_STOP':
            return initialState;
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}