const initialState = {
  fileServer: {
    local: {
      busy: false,
      running: false,
      hostname: 'localhost',
      port: 26331,
      error: null,
    },
    remote: {
      hostname: '',
      port: 26331,
      connected: false,
    },
    baseAddress: 'http://localhost:26331/api/',
  },
  player: {
    local: {
      busy: false,
      running: false,
      hostname: 'localhost',
      port: 26341,
      error: null,
    },
    remote: {
      hostname: '',
      port: 26331,
      connected: false,
    },
    address: null,
  },
  pageLayout: {
    fileServer: {
      localOpen: true,
      remoteOpen: false,
    },
    player: {
      localOpen: true,
      remoteOpen: false,
    },
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'DEVICES_TOGGLE_FS_LOCAL': {
      const pageLayout = { ...state.pageLayout };
      pageLayout.fileServer.localOpen = !(state.pageLayout.fileServer.localOpen);
      return { ...state, pageLayout };
    }
    case 'DEVICES_TOGGLE_PLAYER_LOCAL': {
      const pageLayout = { ...state.pageLayout };
      pageLayout.player.localOpen = !(state.pageLayout.player.localOpen);
      return { ...state, pageLayout };
    }
    case 'DEVICES_TOGGLE_PLAYER_REMOTE': {
      const pageLayout = { ...state.pageLayout };
      pageLayout.player.remoteOpen = !(state.pageLayout.player.remoteOpen);
      return { ...state, pageLayout };
    }
    case 'DEVICES_FS_LOCAL_BUSY': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = action.payload;
      return { ...state, fileServer };
    }
    case 'DEVICES_FS_LOCAL_HOSTNAME': {
      const fileServer = { ...state.fileServer };
      fileServer.local.hostname = action.payload;
      return { ...state, fileServer };
    }
    case 'DEVICES_FS_LOCAL_PORT': {
      const fileServer = { ...state.fileServer };
      fileServer.local.port = action.payload;
      return { ...state, fileServer };
    }
    case 'DEVICES_PLAYER_LOCAL_BUSY': {
      const player = { ...state.player };
      player.local.busy = action.payload;
      return { ...state, player };
    }
    case 'DEVICES_PLAYER_LOCAL_HOSTNAME': {
      const player = { ...state.player };
      player.local.hostname = action.payload;
      return { ...state, player };
    }
    case 'DEVICES_PLAYER_LOCAL_PORT': {
      const player = { ...state.player };
      player.local.port = action.payload;
      return { ...state, player };
    }
    case 'DEVICES_PLAYER_REMOTE_HOSTNAME': {
      const player = { ...state.player };
      player.remote.hostname = action.payload;
      return { ...state, player };
    }
    case 'DEVICES_PLAYER_REMOTE_PORT': {
      const player = { ...state.player };
      player.remote.port = action.payload;
      return { ...state, player };
    }
    case 'FILESERVER_OPEN': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      fileServer.local.running = true;
      fileServer.local.error = null;
      fileServer.baseAddress = action.payload;
      return { ...state, fileServer };
    }
    case 'FILESERVER_OPEN_ERROR': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      fileServer.local.running = false;
      fileServer.local.error = action.payload;
      return { ...state, fileServer };
    }
    case 'FILESERVER_CLOSED': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      fileServer.local.running = false;
      fileServer.local.error = null;
      fileServer.baseAddress = action.payload;
      return { ...state, fileServer };
    }
    case 'FILESERVER_CLOSE_ERROR': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      // fileServer.local.running = true; CAN'T SET THIS, LET'S LEAVE IT AS IT WAS
      fileServer.local.error = action.payload;
      return { ...state, fileServer };
    }
    case 'PLAYERSERVER_OPEN': {
      const player = { ...state.player };
      player.local.busy = false;
      player.local.running = true;
      player.local.error = null;
      player.address = action.payload;
      return { ...state, player };
    }
    case 'PLAYERSERVER_OPEN_ERROR': {
      const player = { ...state.player };
      player.local.busy = false;
      player.local.running = false;
      player.local.error = action.payload;
      return { ...state, player };
    }
    case 'PLAYERSERVER_CLOSED': {
      const player = { ...state.player };
      player.local.busy = false;
      player.local.running = false;
      player.local.error = null;
      // TODO: set baseAddress
      return { ...state, player };
    }
    case 'PLAYERSERVER_CLOSE_ERROR': {
      const player = { ...state.player };
      player.local.busy = false;
      // player.local.running = true; CAN'T SET THIS, LET'S LEAVE IT AS IT WAS
      player.local.error = action.payload;
      return { ...state, player };
    }
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
