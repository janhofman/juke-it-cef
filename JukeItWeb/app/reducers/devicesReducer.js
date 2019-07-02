const initialState = {
  fileServer: {
    local: {
      busy: false,
      running: false,
      hostname: 'localhost',
      port: 26331,
      error: null,
      connected: false,
    },
    remote: {
      hostname: '',
      port: 26331,
      connected: false,
    },
    connected: false,
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
      dialogOpen: false,
    },
    player: {
      localOpen: true,
      remoteOpen: false,
      dialogOpen: false,
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
    case 'DEVICES_TOGGLE_FS_REMOTE': {
      const pageLayout = { ...state.pageLayout };
      pageLayout.fileServer.remoteOpen = !(state.pageLayout.fileServer.remoteOpen);
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
    case 'DEVICES_TOGGLE_FS_DIALOG': {
      const pageLayout = { ...state.pageLayout };
      pageLayout.fileServer.dialogOpen = action.payload;
      return { ...state, pageLayout };
    }
    case 'DEVICES_TOGGLE_PLAYER_DIALOG': {
      const pageLayout = { ...state.pageLayout };
      pageLayout.player.dialogOpen = action.payload;
      return { ...state, pageLayout };
    }
    case 'DEVICES_FS_LOCAL_BUSY': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = action.payload;
      return { ...state, fileServer };
    }
    case 'DEVICES_FS_LOCAL_CHANGE':
        return { ...state, fileServer: { ...state.fileServer, local: action.payload }};
    case 'DEVICES_FS_REMOTE_CHANGE':
        return { ...state, fileServer: { ...state.fileServer, remote: action.payload }};
    case 'DEVICES_PLAYER_LOCAL_CHANGE':
        return { ...state, player: { ...state.player, local: action.payload }};
    case 'DEVICES_PLAYER_REMOTE_CHANGE':
        return { ...state, player: { ...state.player, remote: action.payload }};
    case 'DEVICES_PLAYER_LOCAL_BUSY': {
      const player = { ...state.player };
      player.local.busy = action.payload;
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
    case 'DEVICES_FS_LOCAL_CONNECTED': {
      const fileServer = { ...state.fileServer };
      fileServer.local.connected = true;
      return { ...state, fileServer };
    } 
    case 'DEVICES_FS_REMOTE_CONNECTED': {
      const fileServer = { ...state.fileServer };
      fileServer.remote.connected = true;
      return { ...state, fileServer };
    }    
    case 'DEVICES_FS_CONNECTED': 
      return { ...state, fileServer: { ...state.fileServer, connected: true, baseAddress: action.payload } };
    case 'DEVICES_FS_DISCONNECT': 
      return { ...state, 
        fileServer: { 
          ...state.fileServer, 
          local: {
            ...state.fileServer.local,
            connected: false,
          },
          remote: {
            ...state.fileServer.remote,
            connected: false,
          },
          baseAddress: null,
          connected: false,
        } 
      };
    case 'FILESERVER_OPEN': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      fileServer.local.running = true;
      fileServer.local.error = null;
      fileServer.local.address = action.payload;
      return { ...state, fileServer };
    }
    case 'FILESERVER_OPEN_ERROR': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      fileServer.local.running = false;
      fileServer.local.error = action.payload;      
      fileServer.local.address = null;
      return { ...state, fileServer };
    }
    case 'FILESERVER_CLOSED': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      fileServer.local.running = false;
      fileServer.local.error = null;   
      fileServer.local.address = null;
      fileServer.baseAddress = null;
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
