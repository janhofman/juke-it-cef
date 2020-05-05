import React, { Component } from 'react';
import { connect } from 'react-redux';
import {push} from 'react-router-redux';

import Home from '../../components/Home';
import {logOut} from './../../actions/loginActions';
import { handleRequestClose as el_handleRequestClose } from './../../actions/evenLogActions'

class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.logout = this.logout.bind(this);
    this.handleSnackbarRequestClose = this.handleSnackbarRequestClose.bind(this);
  }

  logout(){
    const { dispatch } = this.props;
    dispatch(push('/'));
    dispatch(logOut());
  }

  handleSnackbarRequestClose() {
    const { dispatch } = this.props;
    dispatch(el_handleRequestClose());
  }

  render() {
    return (
      <Home 
        {...this.props}
        logOut={this.logout}
        onSnackbarRequestClose={this.handleSnackbarRequestClose}
      />
    );
  }
}

export default connect((store) => {
  const { devices, player, eventLog } = store;
  return({
    fsConnected: devices.fileServer.connected,
    playerConnected: player.playerConnected,
    notificationMsg: eventLog.notificationMsg,
    notificationOpen: eventLog.notificationOpen,
  });
})(HomePage)