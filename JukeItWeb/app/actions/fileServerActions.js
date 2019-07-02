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
