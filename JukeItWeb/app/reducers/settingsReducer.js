const initialState = {
    player: {
        local: {
            hostname: '',
            port: 26341,
            runOnStart: true,
            localhost: true,
        },
        remote: {
            hostname: '',
            port: 26341,
            connectOnStart: false,
        },
    },
    fileServer: {
        local: {
            hostname: '',
            port: 26331,
            runOnStart: true,
            localhost: true,
        },
        remote: {
            hostname: '',
            port: 26331,
            connectOnStart: false,
        },
    },
    unsavedChanges: false,
};

export default function reducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
    case 'SETTINGS_FS_LOCAL_CHANGE':
        return { ...state, fileServer: { ...state.fileServer, local: payload }, unsavedChanges: true };
    case 'SETTINGS_FS_REMOTE_CHANGE':
        return { ...state, fileServer: { ...state.fileServer, remote: payload }, unsavedChanges: true };
    case 'SETTINGS_PLAYER_LOCAL_CHANGE':
        return { ...state, player: { ...state.player, local: payload }, unsavedChanges: true };
    case 'SETTINGS_PLAYER_REMOTE_CHANGE':
        return { ...state, player: { ...state.player, remote: payload }, unsavedChanges: true };
    case 'SETTINGS_SAVED':
        return { ...state, unsavedChanges: false };
    case 'SETTINGS_LOADED':
        return { ...state, fileServer: payload.fileServer, player: payload.player, unsavedChanges: false };
    case 'LOGOUT':
        return initialState;
    default:
        return state;
  }
}
