import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Register from '../../components/Register';
import {
  working,
  validatedEmail,
  validatedPasswd,
  validatedName,
  registerError,
} from './../../actions/registerActions';
import { logInError } from './../../actions/loginActions';

// according to w3.org, this regex should satisfy all rules
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
// minimum 8 characters at least 1 alphabet and 1 number:
const passwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\{\}\(\)\[\]#:;~\^,\.\?!\|&\$_`@%\/\\\*\+-='"]{8,}$/;
// no restrictions on name, it just has to be more than 3 characters long
const nameRegex = /^.{3,}$/;

class RegisterPage extends Component {

  validateEmail(email) {
    return (
      emailRegex.test(email)
    );
  }

  validatePasswd(passwd) {
    return (
      passwdRegex.test(passwd)
    );
  }

  validateName(name) {
    return (
      nameRegex.test(name)
    );
  }

  handleSignUp() {
    const { firebase, dispatch } = this.props;
    const email = document.getElementById('email').value;
    const passwd = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    dispatch((dispatch) => {
      // start work, show progress
      dispatch(working(true));
      // validate input fields
      const validEmail = this.validateEmail(email);
      const validPasswd = this.validatePasswd(passwd);
      const validName = this.validateName(name);
      // dispatch validation results
      dispatch(validatedEmail(validEmail));
      dispatch(validatedPasswd(validPasswd));
      dispatch(validatedName(validName));
      // if validation is successful, start communication with server
      if (validEmail && validPasswd && validName) {
        firebase.auth()
          .createUserWithEmailAndPassword(email, passwd)
          .then((user) => {
            //const userId = user.uid;
            //dispatch(logInSuccessful(user));
            //dispatch(setUserId(userId));
            // create user profile
            const profile = {};
            profile[`/public/${user.uid}`] = {
              name,
              facebook: false,
            };
            profile[`/private/${user.uid}`] = {
              credits: 0,
            };
            //dispatch(userUpdate({ name }));
            // register user account
            firebase.database()
              .ref('users')
              .update(profile)
              .then(() => {
                dispatch(working(false));
                dispatch(logInError({ code: 'registerCompleted', message: null }));
                dispatch(push('/'));
              });
          })
          .catch((error) => {
            dispatch(registerError(error));
            console.log(error);
            dispatch(working(false));
          });
      } else {
        // work finished, hide progress
        dispatch(working(false));
      }
    });
  }

  render() {
    return (
      <Register
        {...this.props}
        signUp={this.handleSignUp.bind(this)}
      />
    );
  }
}

export default connect((store) => {
  const { register } = store;
  return ({
    firebase: store.firebase,
    working: register.working,
    invalidEmail: register.invalidEmail,
    invalidPasswd: register.invalidPasswd,
    invalidName: register.invalidName,
    error: register.error,
  });
})(RegisterPage);
