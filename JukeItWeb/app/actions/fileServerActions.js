import { connectFsLocal } from './devicesActions';

function makeRequest(command, payload = null, onSuccess = function () {}, onFailure = function () {}) {
  return (dispatch, getState) => {
    const { cefQuery } = getState();

    const requestObj = { command };
    if (payload) {
      requestObj.payload = payload;
    }

    const request = JSON.stringify(requestObj);

    cefQuery({
      request,
      onSuccess,
      onFailure,
    });
  };
}

function makeRequestWithPromise(command, payload = null) {
  return (dispatch, getState) => {
    const { cefQuery } = getState();

    const requestObj = { command };
    if (payload) {
      requestObj.payload = payload;
    }

    const request = JSON.stringify(requestObj);

    let promise = new Promise((resolve, reject) => {
      cefQuery({
        request,
        onSuccess: (responseStr) => {
          const response = JSON.parse(responseStr);
          resolve(response);
        },
        onFailure: (errorCode, errorMessage) => { 
          reject({ errorCode, errorMessage }); 
        },
      });
    });
    return promise;    
  };
}

function fileServerOpened(address) {
  return {
    type: 'FILESERVER_OPEN',
    payload: address,
  };
}

function fileServerClosed() {
  return {
    type: 'FILESERVER_CLOSED',
  };
}

function fileServerOpenError(error) {
  return {
    type: 'FILESERVER_OPEN_ERROR',
    payload: error,
  };
}

function fileServerCloseError(error) {
  return {
    type: 'FILESERVER_CLOSE_ERROR',
    payload: error,
  };
}
/*
export function openFileServer(hostName = null, port = null) {
  return (dispatch) => {
    // TODO: check if server is already opened
    let payload = null;
    if (hostName || port) {
      payload = { hostName, port };
    }

    const onSuccess = (responseStr) => {
      const response = JSON.parse(responseStr);
      if (response.status === 0) {
        dispatch(fileServerOpened(response.address));
      } else {
        // here warnings can be handled
        dispatch(fileServerOpened(response.address)); 
      }       
      dispatch(connectFsLocal());
    };

    const onFailure = (errorCode, errorMessage) => {
      console.log("Fileserver open error. Code: ", errorCode, ", Message: ", errorMessage);
      dispatch(fileServerOpenError({ errorCode, errorMessage }));
    };

    dispatch(makeRequest('FLS_OPEN_SERVER', payload, onSuccess, onFailure));
  };
}
*/
export function openFileServer(hostName = null, port = null) {
  return (dispatch) => new Promise(function(resolve, reject) {
    // TODO: check if server is already opened
    let payload = null;
    if (hostName || port) {
      payload = { hostName, port };
    }

    const onSuccess = (responseStr) => {
      const response = JSON.parse(responseStr);
      if (response.status === 0) {
        dispatch(fileServerOpened(response.address));
      } else {
        // here warnings can be handled
        dispatch(fileServerOpened(response.address)); 
      }       
      dispatch(connectFsLocal())
        .then(() => resolve())
        .catch((error) => reject(error));
    };

    const onFailure = (errorCode, errorMessage) => {
      console.log("Fileserver open error. Code: ", errorCode, ", Message: ", errorMessage);
      dispatch(fileServerOpenError({ errorCode, errorMessage }));
      reject(errorCode, errorMessage);
    };

    dispatch(makeRequest('FLS_OPEN_SERVER', payload, onSuccess, onFailure));
  });
}

export function closeFileServer() {
  return (dispatch) => {
    // TODO: check if server is running

    const onSuccess = (responseStr) => {
      const response = JSON.parse(responseStr);
      if (response.status === 0) {
        dispatch(fileServerClosed());
      } else {
        // here warnings can be handled
        dispatch(fileServerClosed());
      }
    };

    const onFailure = (errorCode, errorMessage) => {
      dispatch(fileServerCloseError({ errorCode, errorMessage }));
    };

    dispatch(makeRequest('FLS_CLOSE_SERVER', null, onSuccess, onFailure));
  };
}

export function getUnavailableFiles() {
  return (dispatch) => {
    return dispatch(makeRequestWithPromise('FLS_GET_NOT_FOUND_FILES'));
  };
}

export function runFileAvailabilityCheck() {
  return (dispatch) => {
    return dispatch(makeRequestWithPromise('FLS_FILE_AVAILABILITY_CHECK'));
  };
}

export function removeFile(songId) {
  return (dispatch) => {
    const payload = {
      songId
    };
    return dispatch(makeRequestWithPromise('FLS_REMOVE_ONE_FILE', payload));
  };
}

export function refreshFileAvailability(songId) {
  return (dispatch) => {
    const payload = {
      songId
    };
    return dispatch(makeRequestWithPromise('FLS_REFRESH_FILE_AVAILABILITY', payload));
  };
}
