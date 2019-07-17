import axios from 'axios';
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

export function toggleFileServerRemote() {
  return ({
    type: 'DEVICES_TOGGLE_FS_REMOTE',
  });
}

function localFileServerBusy(busy) {
  return ({
    type: 'DEVICES_FS_LOCAL_BUSY',
    payload: busy,
  });
}

export function fsLocalChange(changes) {
  return {
      type: 'DEVICES_FS_LOCAL_CHANGE',
      payload: changes,
  };
}

export function fsRemoteChange(changes) {
  return {
      type: 'DEVICES_FS_REMOTE_CHANGE',
      payload: changes,
  };
}

export function playerLocalChange(changes) {
  return {
      type: 'DEVICES_PLAYER_LOCAL_CHANGE',
      payload: changes,
  };
}

export function playerRemoteChange(changes) {
  return {
      type: 'DEVICES_PLAYER_REMOTE_CHANGE',
      payload: changes,
  };
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

export function togglePlayerDialog(open) {
  return ({
    type: 'DEVICES_TOGGLE_PLAYER_DIALOG',
    payload: open,
  });
}

export function toggleFsDialog(open) {
  return ({
    type: 'DEVICES_TOGGLE_FS_DIALOG',
    payload: open,
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

function fsLocalConnected() {
  return ({
    type: 'DEVICES_FS_LOCAL_CONNECTED',
  });
}

function fsRemoteConnected() {
  return ({
    type: 'DEVICES_FS_REMOTE_CONNECTED',
  });
}

function fsConnected(address) {
  return ({
    type: 'DEVICES_FS_CONNECTED',
    payload: address,
  });
}

export function disconnectFileServer() {
  return ({
    type: 'DEVICES_FS_DISCONNECT',
  });
}

export function openFileServerLocal() {
  return (dispatch, getState) => new Promise(function(resolve, reject) {
    const { devices: { fileServer: { local } } } = getState();

    if (!local.running && !local.busy) {
      dispatch(localFileServerBusy(true));
      dispatch(openFileServer(local.hostname, local.port))
        .then(() => resolve())
        .catch((errorCode, errorMessage) => reject(errorCode, errorMessage));
    } else {      
      resolve();
    }
  });
}

export function closeFileServerLocal() {
  return ((dispatch, getState) => {
    const { devices: { fileServer: { local } } } = getState();

    if (local.running && !local.busy) {
      dispatch(localFileServerBusy(true));
      dispatch(disconnectFileServer());
      dispatch(closeFileServer());
    }
  });
}

export function openPlayerLocal() {
  return (dispatch, getState) => new Promise(function (resolve, reject) {
    const { devices: { player: { local } } } = getState();

    if (!local.running && !local.busy) {
      dispatch(localPlayerBusy(true));
      dispatch(openPlayerServer(local.hostname, local.port))
        .then(() => resolve())
        .catch((error) => reject(error));
    } else{
      resolve();
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

    dispatch(fsLocalChange({
      hostname: local.localhost ? 'localhost' : local.hostname,
      port: local.port,
    }));
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
    dispatch(playerLocalChange({
      hostname: local.localhost ? 'localhost' : local.hostname,
      port: local.port,
    }));
    /*** REMOTE SETTINGS ***/
    dispatch(playerRemoteChange({
      hostname: remote.hostname,
      port: remote.port,
    })); 
  }
}

export function initialize() {
  return (dispatch) => {
    dispatch(initializeFileServer())
      .then(dispatch(initializePlayer()));
  }
}

export function initializeFileServer() {
  return (dispatch, getState) => new Promise(function(resolve, reject) {
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
      dispatch(openFileServerLocal())
        .then(() => resolve())
        .catch((error) => reject(error));
    } else if(remote.connectOnStart) {
      dispatch(connectFsRemote())
      .then(() => resolve())
      .catch((error) => reject(error));
    } else {
      resolve();
    }
  });
}

export function initializePlayer() {
  return (dispatch, getState) => new Promise(function (resolve, reject) {
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
        dispatch(openPlayerLocal())
        .then(() => resolve())
        .catch((error) => reject(error));
    } else if (remote.connectOnStart === true) {
      dispatch(connectToRemotePlayer())
        .then(() => resolve())
        .catch((error) => reject(error));
    } else {
      resolve();
    }
  });
}

function testHostame(hostname, dispatch) {
  const rtc = true;

  return rtc;
}

function testPortNumber(portNumber, dispatch) {
  const rtc = true;

  return rtc;
}

function pingFileServer(baseUrl) {
  let url = baseUrl;
  if (!url.endsWith('/')) {
    url += '/';
  }
  url = `${url}v1/ping`;

  return axios.get(url).then((response) => {
    if (response.status === 200) {
      return true;
    }
    return false;
  }).catch((error) => {
    return error;
  });
}

export function connectFsLocal() {
  return (dispatch, getState) => new Promise(function (resolve, reject) {
    const {
      devices: {
        fileServer: {
          local: {
            running,
            address,
          },
        },
      },
    } = getState();

    if (running && address) {      
      pingFileServer(address)
        .then((available) => {
          if (available) {
            dispatch(fsLocalConnected());
            dispatch(fsConnected(address));
            resolve();            
          } else {
            // TODO: show error that fs is not available
            reject();
          }
          
        })
        .catch((error) => reject(error));
    } else {
      resolve();
    }
  });
}

export function connectFsRemote() {
  return (dispatch, getState) => new Promise(function (resolve, reject) {
    const {
      devices: {
        fileServer: {
          remote: {
            hostname,
            port,
            connected,
          },
        },
      },
    } = getState();

    if (!connected && testHostame(hostname) && testPortNumber(port)) {
      let url = 'http://';
      if (hostname.toLowerCase().startsWith('http://')) {
        url = hostname;
      } else {
        url += hostname;
      }
      url += `:${port}/api`;

      pingFileServer(url)
        .then((available) => {
          if (available) {
            dispatch(fsRemoteConnected());
            dispatch(fsConnected(url));
            resolve();            
          } else {
            // TODO: show error that fs is not available
            reject();
          }
          
        })
        .catch((error) => reject(error));
    } else {
      resolve();
    }
  });
}

