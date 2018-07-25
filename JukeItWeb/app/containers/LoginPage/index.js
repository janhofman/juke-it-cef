import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import Login from './../../components/Login';
import {
    emptyEmail,
    emptyPasswd,
    loggingIn,
    logInSuccessful,
    logInError,
    addFirebaseListeners,
} from './../../actions/loginActions';
import {
    spotUpdate,
    userUpdate,
    setUserId,
    setSpotId,
} from './../../actions/userDataActions';
import { openFileServerLocal } from './../../actions/devicesActions';

class LoginPage extends Component {
  fetchUserDataOnce(firebase, userId) {
    const userRef = firebase.database().ref('users');
    const ops = [];
    ops.push(userRef.child('private').child(userId).once('value'));
    ops.push(userRef.child('public').child(userId).once('value'));
    return Promise.all(ops).then((snapshots) => ({ ...snapshots[0].val(), ...snapshots[1].val() }));
  }

  fetchSpotDataOnce(firebase, spotId) {
    const spotRef = firebase.database().ref('spots');
    const ops = [];
    ops.push(spotRef.child('private').child(spotId).once('value'));
    ops.push(spotRef.child('public').child(spotId).once('value'));
    return Promise.all(ops).then((snapshots) => ({ ...snapshots[0].val(), ...snapshots[1].val() }));
  }

  logIn = function () {
        // get email and password
    const email = document.getElementById('email').value;
    const passwd = document.getElementById('password').value;

        // dispatch events
    this.props.dispatch((dispatch) => {
            // verify input
      dispatch(emptyEmail(!email.length));
      dispatch(emptyPasswd(!passwd.length));
      if (email.length > 0 && passwd.length > 0) {
        const { firebase } = this.props;
        dispatch(loggingIn());
        firebase.auth()
          .signInWithEmailAndPassword(email, passwd)
          .then((user) => {
            const userId = user.uid;
            dispatch(logInSuccessful(user));
            dispatch(setUserId(userId));
              // fetch all user data
            this.fetchUserDataOnce(firebase, userId).then((userData) => {
              dispatch(userUpdate(userData));
              // check if user has spot
              if (!userData.adminForSpot) {
                // user doesn't have a spot yet
                dispatch(push('/spotregister'));
              } else {
                const spotId = userData.adminForSpot;
                // user has spot, log them in
                const spotPromise = this.fetchSpotDataOnce(firebase, spotId);
                dispatch(setSpotId(spotId));
                spotPromise.then((spotData) => {
                  dispatch(spotUpdate(spotData));
                  dispatch(addFirebaseListeners(userId, spotId));
                  dispatch(openFileServerLocal());
                  dispatch(push('/home'));// history.push('/home');
                });
              }
            });
          })
          .catch((error) => dispatch(logInError(error)));
      }
    });
  }

  render() {
    return (
      <Login
        {...this.props}
        logIn={this.logIn.bind(this)}
      />
    );
  }
}

export default connect((store) => {
  const { login, firebase } = store;
  return ({
    emptyPasswd: login.emptyPasswd,
    emptyEmail: login.emptyEmail,
    authorizing: login.authorizing,
    authorized: login.authorized,
    error: login.error,
    firebase,
  });
})(LoginPage);
