import {
  openFileServer,
  closeFileServer,
} from './fileServerActions';

import {
  openPlayerServer,
  closePlayerServer,
} from './playerServerActions';

import {
  connectToRemotePlayer,
} from './playerActions';

export function toggleFileServerLocal() {
  return ({
    type: 'DEVICES_TOGGLE_FS_LOCAL',
  });
}

function localFileServerBusy(busy) {
  return ({
    type: 'DEVICES_FS_LOCAL_BUSY',
    payload: busy,
  });
}

export function fsLocalHostnameChange(hostname) {
  return ({
    type: 'DEVICES_FS_LOCAL_HOSTNAME',
    payload: hostname,
  });
}

export function fsLocalPortChange(port) {
  return ({
    type: 'DEVICES_FS_LOCAL_PORT',
    payload: port,
  });
}

export function playerLocalHostnameChange(hostname) {
  return ({
    type: 'DEVICES_PLAYER_LOCAL_HOSTNAME',
    payload: hostname,
  });
}

export function playerLocalPortChange(port) {
  return ({
    type: 'DEVICES_PLAYER_LOCAL_PORT',
    payload: port,
  });
}

export function playerRemoteHostnameChange(hostname) {
  return ({
    type: 'DEVICES_PLAYER_REMOTE_HOSTNAME',
    payload: hostname,
  });
}

export function playerRemotePortChange(port) {
  return ({
    type: 'DEVICES_PLAYER_REMOTE_PORT',
    payload: port,
  });
}

export function openFileServerLocal() {
  return ((dispatch, getState) => {
    const { devices: { fileServer: { local } } } = getState();

    if (!local.running && !local.busy) {
      dispatch(localFileServerBusy(true));
      dispatch(openFileServer(local.hostname, local.port));
    }
  });
}

export function closeFileServerLocal() {
  return ((dispatch, getState) => {
    const { devices: { fileServer: { local } } } = getState();

    if (local.running && !local.busy) {
      dispatch(localFileServerBusy(true));
      dispatch(closeFileServer());
    }
  });
}

export function togglePlayerLocal() {
  return ({
    type: 'DEVICES_TOGGLE_PLAYER_LOCAL',
  });
}

export function togglePlayerRemote() {
  return ({
    type: 'DEVICES_TOGGLE_PLAYER_REMOTE',
  });
}

function localPlayerBusy(busy) {
  return ({
    type: 'DEVICES_PLAYER_LOCAL_BUSY',
    payload: busy,
  });
}

export function openPlayerLocal() {
  return ((dispatch, getState) => {
    const { devices: { player: { local } } } = getState();

    if (!local.running && !local.busy) {
      dispatch(localPlayerBusy(true));
      dispatch(openPlayerServer(local.hostname, local.port));
    }
  });
}

export function closePlayerLocal() {
  return ((dispatch, getState) => {
    const { devices: { player: { local } } } = getState();

    if (local.running) {
      dispatch(localPlayerBusy(true));
      dispatch(closePlayerServer());
    }
  });
}

export function loadFileServerSettings() {
  return (dispatch, getState) => {
    const {
      settings: {
        fileServer: {
          local, 
          remote,
        }
      }
    } = getState();

    if (local.localhost) {
      dispatch(fsLocalHostnameChange('localhost'));
    } else {      
      dispatch(fsLocalHostnameChange(local.hostname));
    }
    dispatch(fsLocalPortChange(local.port));
  }
}

export function loadPlayerSettings() {
  return (dispatch, getState) => {
    const {
      settings: {
        player: {
          local, 
          remote,
        }
      }
    } = getState();

    /*** LOCAL SETTINGS ***/
    if (local.localhost) {
      dispatch(playerLocalHostnameChange('localhost'));
    } else {      
      dispatch(playerLocalHostnameChange(local.hostname));
    }
    dispatch(playerLocalPortChange(local.port));
    /*** REMOTE SETTINGS ***/
    dispatch(playerRemoteHostnameChange(remote.hostname));
    dispatch(playerRemotePortChange(remote.port));      
  }
}

export function initialize() {
  return (dispatch) => {
    dispatch(initializeFileServer());
    dispatch(initializePlayer());
  }
}

export function initializeFileServer() {
  return (dispatch, getState) => {
    const {
      settings: {
        fileServer: {
          local, 
          remote,
        }
      }
    } = getState();

    dispatch(loadFileServerSettings());

    if (local.runOnStart) {
      dispatch(openFileServerLocal());
    }
  }
}

export function initializePlayer() {
  return (dispatch, getState) => {
    const {
      settings: {
        player: {
          local, 
          remote,
        }
      }
    } = getState();

    dispatch(loadPlayerSettings());

    if (local.runOnStart === true) {
      dispatch(openPlayerLocal());
    } else if (remote.connectOnStart === true) {
      dispatch(connectToRemotePlayer());
    }    
  }
}

