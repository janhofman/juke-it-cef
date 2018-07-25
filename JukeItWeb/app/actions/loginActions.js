import {
    userUpdate,
    spotUpdate,
} from './userDataActions';
import {
    queueUpdate,
    removePlaylist,
    wipeQueue,
} from './playbackActions';
import { closeFileServerLocal } from './devicesActions';

export function emptyEmail(empty) {
  return ({
    type: 'LOGIN_EMPTY_EMAIL',
    payload: empty,
  });
}

export function emptyPasswd(empty) {
  return ({
    type: 'LOGIN_EMPTY_PASSWD',
    payload: empty,
  });
}

export function loggingIn() {
  return ({
    type: 'LOGIN_LOGGING_IN',
  });
}

export function logInSuccessful(user) {
  return ({
    type: 'LOGIN_SUCCESSFUL',
    payload: user,
  });
}

export function logInError(error) {
  return ({
    type: 'LOGIN_ERROR',
    payload: error,
  });
}

// all firebase listeners should be added in this function
export function addFirebaseListeners(userId, spotId) {
  return ((dispatch, getState) => {
    const { firebase } = getState();
    const db = firebase.database();
    const userRef = db.ref('users');
    const spotRef = db.ref('spots');
    const queRef = db.ref('que');
        // listen to user changes
    userRef.child('private')
            .child(userId)
            .on('value', (snapshot) => dispatch(userUpdate(snapshot.val())));
    userRef.child('public')
            .child(userId)
            .on('value', (snapshot) => dispatch(userUpdate(snapshot.val())));
        // listen to que
    queRef.child(spotId)
            .on('value', (snapshot) => dispatch(queueUpdate(snapshot.val())));
        // listen to spot data
    spotRef.child('public')
            .child(spotId)
            .on('value', (snapshot) => dispatch(spotUpdate(snapshot.val())));
    spotRef.child('private')
            .child(spotId)
            .on('value', (snapshot) => dispatch(spotUpdate(snapshot.val())));
  });
}

export function removeFirebaseListeners(userId, spotId) {
  return ((dispatch, getState) => {
    const { firebase } = getState();
    const db = firebase.database();
    const userRef = db.ref('users');
    const spotRef = db.ref('spots');
    const queRef = db.ref('que');
        // user changes
    userRef.child('private').child(userId).off();
    userRef.child('public').child(userId).off();
        // que
    queRef.child(spotId).off();
        // spot
    spotRef.child('public').child(spotId).off();
    spotRef.child('private').child(spotId).off();
  });
}

export function logOut() {
  return ((dispatch, getState) => {
    const { firebase, userData } = getState();
    const { userId, spotId } = userData;
    // first remove all database callbacks
    dispatch(removeFirebaseListeners(userId, spotId));
    // set spot as inactive
    firebase.database().ref('spots/public').child(spotId).update({ active: false });
    // remove playlist
    dispatch(removePlaylist());
    // wipe queue
    dispatch(wipeQueue());
    // close fileServer
    dispatch(closeFileServerLocal());
    // sign out user from firebase
    firebase.auth().signOut()
            // dispatch event that wipes data
            .then(() => dispatch({ type: 'LOGOUT' }));
  });
}
