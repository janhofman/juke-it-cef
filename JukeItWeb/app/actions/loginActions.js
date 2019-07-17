import { push } from 'react-router-redux';
import {
  userUpdate,
  spotUpdate,
  setSpotId,
  setUserId,
} from './userDataActions';
import {
  orderQueueChildAdded,
  orderQueueChildRemoved,
  removePlaylist,
  wipeQueue,
} from './playbackActions';
import {
  closeFileServerLocal,
  closePlayerLocal,
} from './devicesActions';
import {
  disconnect as disconnectPlayer,
} from './playerActions';
import {
  load as loadSettings,
} from './settingsActions'


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
            .on('child_added', (snapshot) => dispatch(orderQueueChildAdded(snapshot.key, snapshot.val())));
    queRef.child(spotId)
            .on('child_removed', (snapshot) => dispatch(orderQueueChildRemoved(snapshot.key)));
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
    if (userId) {
      // user changes
      userRef.child('private').child(userId).off();
      userRef.child('public').child(userId).off();
    }
    if (spotId) {
      // que
      queRef.child(spotId).off();
      // spot
      spotRef.child('public').child(spotId).off();
      spotRef.child('private').child(spotId).off();
    }
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
    // disconnect player
    dispatch(disconnectPlayer());
    // close player
    dispatch(closePlayerLocal());
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

function fetchUserDataOnce(firebase, userId) {
  const userRef = firebase.database().ref('users');
  const ops = [];
  ops.push(userRef.child('private').child(userId).once('value'));
  ops.push(userRef.child('public').child(userId).once('value'));
  return Promise.all(ops).then((snapshots) => ({ ...snapshots[0].val(), ...snapshots[1].val() }));
}

function fetchSpotDataOnce(firebase, spotId) {
  const spotRef = firebase.database().ref('spots');
  const ops = [];
  ops.push(spotRef.child('private').child(spotId).once('value'));
  ops.push(spotRef.child('public').child(spotId).once('value'));
  return Promise.all(ops).then((snapshots) => ({ ...snapshots[0].val(), ...snapshots[1].val() }));
}

export function logIn(email, passwd) {
  return (dispatch, getState) => {
    const { firebase } = getState();
    dispatch(loggingIn());
    firebase.auth()
      .signInWithEmailAndPassword(email, passwd)
      .then((user) => {
        const userId = user.uid;
        dispatch(logInSuccessful(user));
        dispatch(setUserId(userId));
        // fetch all user data
        fetchUserDataOnce(firebase, userId).then((userData) => {
          dispatch(userUpdate(userData));
          // check if user has spot
          if (!userData.adminForSpot) {
            // user doesn't have a spot yet
            dispatch(push('/spotregister'));
          } else {
            const spotId = userData.adminForSpot;
            // user has spot, log them in
            const spotPromise = fetchSpotDataOnce(firebase, spotId);
            dispatch(setSpotId(spotId));
            spotPromise.then((spotData) => {
              dispatch(spotUpdate(spotData));
              dispatch(addFirebaseListeners(userId, spotId));
              // dispatch(openFileServerLocal());
              // dispatch(openPlayerLocal());
              dispatch(loadSettings());
              dispatch(push('/home'));// history.push('/home');
            });
          }
        });
      })
      .catch((error) => dispatch(logInError(error)));
  };
}
