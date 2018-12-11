import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Devices from '../../components/Devices';
import {
  toggleFileServerLocal,
  openFileServerLocal,
  closeFileServerLocal,
  togglePlayerLocal,
  openPlayerLocal,
  closePlayerLocal,
  fsLocalHostnameChange,
  fsLocalPortChange,
  playerLocalHostnameChange,
  playerLocalPortChange,
} from '../../actions/devicesActions';
import {
  connectToLocalPlayer,
  disconnect,
} from '../../actions/playerActions';

class DevicesPage extends Component {
  constructor(props) {
    super(props);

    this.toggleFileServerLocal = this.toggleFileServerLocal.bind(this);
    this.openFileServerLocal = this.openFileServerLocal.bind(this);
    this.closeFileServerLocal = this.closeFileServerLocal.bind(this);
    this.togglePlayerLocal = this.togglePlayerLocal.bind(this);
    this.onOpenPlayerLocal = this.onOpenPlayerLocal.bind(this);
    this.onClosePlayerLocal = this.onClosePlayerLocal.bind(this);
    this.onConnectToLocalPlayer = this.onConnectToLocalPlayer.bind(this);
    this.onDisconnectPlayer = this.onDisconnectPlayer.bind(this);
    this.onFsLocalHostnameChange = this.onFsLocalHostnameChange.bind(this);
    this.onFsLocalPortChange = this.onFsLocalPortChange.bind(this);
    this.onPlayerLocalHostnameChange = this.onPlayerLocalHostnameChange.bind(this);
    this.onPlayerLocalPortChange = this.onPlayerLocalPortChange.bind(this);
  }

  onFsLocalHostnameChange(event) {
    const { dispatch } = this.props;
    dispatch(fsLocalHostnameChange(event.target.value));
  }

  onFsLocalPortChange(event) {
    const { dispatch } = this.props;
    dispatch(fsLocalPortChange(event.target.value));
  }

  onPlayerLocalHostnameChange(event) {
    const { dispatch } = this.props;
    dispatch(playerLocalHostnameChange(event.target.value));
  }

  onPlayerLocalPortChange(event) {
    const { dispatch } = this.props;
    dispatch(playerLocalPortChange(event.target.value));
  }

  toggleFileServerLocal() {
    const { dispatch } = this.props;
    dispatch(toggleFileServerLocal());
  }

  openFileServerLocal() {
    const { dispatch } = this.props;
    dispatch(openFileServerLocal());
  }

  closeFileServerLocal() {
    const { dispatch } = this.props;
    dispatch(closeFileServerLocal());
  }

  togglePlayerLocal() {
    const { dispatch } = this.props;
    dispatch(togglePlayerLocal());
  }

  onOpenPlayerLocal() {
    const { dispatch } = this.props;
    dispatch(openPlayerLocal());
  }

  onClosePlayerLocal() {
    const { dispatch } = this.props;
    dispatch(closePlayerLocal());
  }

  onConnectToLocalPlayer() {
    const { dispatch } = this.props;
    dispatch(connectToLocalPlayer());
  }

  onDisconnectPlayer() {
    const { dispatch } = this.props;
    dispatch(disconnect());
  }

  render() {
    return (
      <Devices
        {...this.props}
        toggleFileServerLocal={this.toggleFileServerLocal}
        openFileServerLocal={this.openFileServerLocal}
        closeFileServerLocal={this.closeFileServerLocal}
        togglePlayerLocal={this.togglePlayerLocal}
        onOpenPlayerLocal={this.onOpenPlayerLocal}
        onClosePlayerLocal={this.onClosePlayerLocal}
        onConnectToLocalPlayer={this.onConnectToLocalPlayer}
        onDisconnectPlayer={this.onDisconnectPlayer}
        onFsLocalHostnameChange={this.onFsLocalHostnameChange}
        onFsLocalPortChange={this.onFsLocalPortChange}
        onPlayerLocalHostnameChange={this.onPlayerLocalHostnameChange}
        onPlayerLocalPortChange={this.onPlayerLocalPortChange}
      />
    );
  }
}

DevicesPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect((store) => {
  const { devices, player: playerStore } = store;
  const { fileServer, player, pageLayout } = devices;
  return ({
    fileServer,
    player,
    pageLayout,
    playerConnected: playerStore.playerConnected,
  });
})(DevicesPage);
