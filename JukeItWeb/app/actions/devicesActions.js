import {
  openFileServer,
  closeFileServer,
} from './fileServerActions';

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
