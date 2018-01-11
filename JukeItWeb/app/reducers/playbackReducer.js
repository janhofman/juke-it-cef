const initialState = {
    activePlaylist: null,
    queue: null,
    queueOpen: false,
    contextMenuOpen: false,
    contextMenuAnchor: null,
    songId: null,
}

export default function reducer(state=initialState, action){
    const {type, payload} = action;
    switch(type){
        case 'PLAYBACK_PLAYLIST_CHANGED':
            return {...state, activePlaylist: payload};
        case 'PLAYBACK_QUEUE_UPDATE':
            return {...state, queue: payload};
        case 'PLAYBACK_TOGGLE_QUEUE':
            return {...state, queueOpen: !state.queueOpen}
        case 'PLAYBACK_OPEN_CONTEXT_MENU':
            return {...state, contextMenuOpen: true, contextMenuAnchor: payload.anchor, songId: payload.songId};
        case 'PLAYBACK_CLOSE_CONTEXT_MENU':
            return {...state, contextMenuOpen: false, contextMenuAnchor: null, songId: null};
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}