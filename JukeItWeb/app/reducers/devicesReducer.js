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
      address: null,
      connected: false,
    },
    baseAddress: 'http://localhost:26331/api/',
  },
  player: {

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
    case 'DEVICES_FS_LOCAL_BUSY': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = action.payload;
      return { ...state, fileServer };
    }
    case 'FILESERVER_OPEN': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      fileServer.local.running = true;
      fileServer.local.error = null;
      // TODO: set baseAddress
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
      // TODO: set baseAddress
      return { ...state, fileServer };
    }
    case 'FILESERVER_CLOSE_ERROR': {
      const fileServer = { ...state.fileServer };
      fileServer.local.busy = false;
      // fileServer.local.running = true; CAN'T SET THIS, LET'S LEAVE IT AS IT WAS
      fileServer.local.error = action.payload;
      return { ...state, fileServer };
    }
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
