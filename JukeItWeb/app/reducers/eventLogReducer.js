const initialState = {
    eventLog: [],
    notifications: [],
    notificationMsg: '',
    notificationOpen: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'LOGOUT':
      return initialState;
    case 'EVENTLOG_ON_REQUEST_CLOSE':
      if(state.notifications.length > 0){
          return {
              ...state, 
              notifications: state.notifications.slice(1),
              notificationMsg: state.notifications[0]
          }
      } else {
          return { ...state, notificationOpen: false };
      }
    case 'EVENTLOG_NOTIFY':
        if(state.notifications.length > 0 || state.notificationOpen) {
            return { ...state, notifications: [ ...state.notifications, action.payload ] };
        } else {
            return { ...state, notificationMsg: action.payload, notificationOpen: true };
        }
    default:
      return state;
  }
}
