import{
  connectToLocalPlayer,
} from './playerActions';

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

function playerServerOpened(address) {
  return {
    type: 'PLAYERSERVER_OPEN',
    payload: address,
  };
}

function playerServerClosed() {
  return {
    type: 'PLAYERSERVER_CLOSED',
  };
}

function playerServerOpenError(error) {
  return {
    type: 'PLAYERSERVER_OPEN_ERROR',
    payload: error,
  };
}

function playerServerCloseError(error) {
  return {
    type: 'PLAYERSERVER_CLOSE_ERROR',
    payload: error,
  };
}

export function openPlayerServer(ipAddress = null, port = null) {
  return (dispatch) => new Promise(function(resolve, reject) {
    // TODO: check if server is already opened
    let payload = null;
    if (ipAddress || port) {
      payload = { ipAddress, port };
    }

    const onSuccess = (responseStr) => {
      const response = JSON.parse(responseStr);
      if (response.status === 0) {
        dispatch(playerServerOpened(response.address));        
      } else {
        // here warnings can be handled
        dispatch(playerServerOpened(response.address));
      }
      dispatch(connectToLocalPlayer())
        .then(() => resolve())
        .catch((error) => reject(error));
    };

    const onFailure = (errorCode, errorMessage) => {
      dispatch(playerServerOpenError({ errorCode, errorMessage }));
      reject({errorCode, errorMessage});
    };

    dispatch(makeRequest('MPL_OPEN_PLAYER', payload, onSuccess, onFailure));
  });
}

export function closePlayerServer() {
  return (dispatch) => {
    // TODO: check if server is running

    const onSuccess = (responseStr) => {
      const response = JSON.parse(responseStr);
      if (response.status === 0) {
        dispatch(playerServerClosed());
      } else {
        // here warnings can be handled
        dispatch(playerServerClosed());
      }
    };

    const onFailure = (errorCode, errorMessage) => {
      dispatch(playerServerCloseError({ errorCode, errorMessage }));
    };

    dispatch(makeRequest('MPL_CLOSE_PLAYER', null, onSuccess, onFailure));
  };
}
