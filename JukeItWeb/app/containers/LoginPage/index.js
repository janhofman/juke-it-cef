import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Login from './../../components/Login';
import {
    emptyEmail,
    emptyPasswd,
  logIn,
} from './../../actions/loginActions';

class LoginPage extends Component {
  constructor(props) {
    super(props);

    this.logIn = this.logIn.bind(this);
  }

  logIn() {
    // get email and password
    const email = document.getElementById('email').value;
    const passwd = document.getElementById('password').value;
    const { dispatch } = this.props;

    // verify input
    dispatch(emptyEmail(!email.length));
    dispatch(emptyPasswd(!passwd.length));
    if (email.length > 0 && passwd.length > 0) {
      dispatch(logIn(email, passwd));
    }
  }

  render() {
    return (
      <Login
        {...this.props}
        logIn={this.logIn}
      />
    );
  }
}

LoginPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect((store) => {
  const { login, firebase } = store;
  return ({
    emptyPasswd: login.emptyPasswd,
    emptyEmail: login.emptyEmail,
    authorizing: login.authorizing,
    authorized: login.authorized,
    errorCode: login.errorCode,
    firebase,
  });
})(LoginPage);
