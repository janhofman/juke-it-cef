const initialState = {
    dialog: false,
    playlists: [],
    playlistsLoaded: false,
    playlistsPromise: null,
};

export default function reducer(state=initialState, action){
    const {type, payload} = action;
    switch(type){
        case 'PLAYLISTS_CHANGE':
            return {...state, playlists: payload.playlists, playlistsLoaded: payload.playlistsLoaded};
        case 'PLAYLISTS_SET_PROMISE':
            return {...state, playlistsPromise: payload};
        case 'PLAYLISTS_SHOW_DIALOG':
            return {...state, dialog: payload};
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}