export function notify(notification){
    return {
        type: 'EVENTLOG_NOTIFY',
        payload: notification,
      };
}

export function logEvent() {

}

export function logError() {

}

export function handleRequestClose () {
    return {
        type: 'EVENTLOG_ON_REQUEST_CLOSE'
      };
}