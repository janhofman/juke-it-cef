export function notify(notification){
    return {
        type: 'EVENTLOG_NOTIFY',
        payload: notification,
      };
}

export function logEvent() {

}

export function logError(message) {
  return (dispatch, getState) => {
    const { cefQuery } = getState();

    let requestObj = {
      command: 'LOG_ERROR',
      payload: {
        message,
      }
    };

    const request = JSON.stringify(requestObj);
    cefQuery({
      request,
      onSuccess: () => {},
      onFailure: () => {},
    });    
  };
}

export function handleRequestClose () {
    return {
        type: 'EVENTLOG_ON_REQUEST_CLOSE'
      };
}