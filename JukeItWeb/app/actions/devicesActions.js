import {
  openFileServer,
  closeFileServer,
} from './fileServerActions';

import {
  openPlayerServer,
  closePlayerServer,
} from './playerServerActions';

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

export function playerLocalHostnameChange(hostname) {
  return ({
    type: 'DEVICES_PLAYER_LOCAL_HOSTNAME',
    payload: hostname,
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

export function playerLocalPortChange(port) {
  return ({
    type: 'DEVICES_PLAYER_LOCAL_PORT',
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

