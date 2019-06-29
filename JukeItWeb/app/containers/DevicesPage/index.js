import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Devices from '../../components/Devices';
import {
  toggleFileServerLocal,
  openFileServerLocal,
  closeFileServerLocal,
  togglePlayerLocal,
  togglePlayerRemote,
  openPlayerLocal,
  closePlayerLocal,
  fsLocalHostnameChange,
  fsLocalPortChange,
  playerLocalHostnameChange,
  playerLocalPortChange,
  playerRemoteHostnameChange,
  playerRemotePortChange,
  loadPlayerSettings,
  loadFileServerSettings,
} from '../../actions/devicesActions';
import {
  connectToLocalPlayer,
  connectToRemotePlayer,
  disconnect,
} from '../../actions/playerActions';

class DevicesPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      fsDialogOpen: false,
      playerDialogOpen: false,
    }

    this.toggleFileServerLocal = this.toggleFileServerLocal.bind(this);
    this.openFileServerLocal = this.openFileServerLocal.bind(this);
    this.closeFileServerLocal = this.closeFileServerLocal.bind(this);
    this.togglePlayerLocal = this.togglePlayerLocal.bind(this);
    this.togglePlayerRemote = this.togglePlayerRemote.bind(this);
    this.onOpenPlayerLocal = this.onOpenPlayerLocal.bind(this);
    this.onClosePlayerLocal = this.onClosePlayerLocal.bind(this);
    this.onConnectToLocalPlayer = this.onConnectToLocalPlayer.bind(this);
    this.onConnectToRemotePlayer = this.onConnectToRemotePlayer.bind(this);
    this.onDisconnectPlayer = this.onDisconnectPlayer.bind(this);
    this.onFsLocalHostnameChange = this.onFsLocalHostnameChange.bind(this);
    this.onFsLocalPortChange = this.onFsLocalPortChange.bind(this);
    this.onPlayerLocalHostnameChange = this.onPlayerLocalHostnameChange.bind(this);
    this.onPlayerLocalPortChange = this.onPlayerLocalPortChange.bind(this);
    this.onPlayerRemoteHostnameChange = this.onPlayerRemoteHostnameChange.bind(this);
    this.onPlayerRemotePortChange = this.onPlayerRemotePortChange.bind(this);

    this.onCloseFsDialog = this.onCloseFsDialog.bind(this);
    this.onPlayerDialog = this.onPlayerDialog.bind(this);
    this.onClosePlayerDialog = this.onClosePlayerDialog.bind(this);
    this.onReloadPlayerSettings = this.onReloadPlayerSettings.bind(this);
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

  onPlayerRemoteHostnameChange(event) {
    const { dispatch } = this.props;
    dispatch(playerRemoteHostnameChange(event.target.value));
  }

  onPlayerRemotePortChange(event) {
    const { dispatch } = this.props;
    dispatch(playerRemotePortChange(event.target.value));
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

  togglePlayerRemote() {
    const { dispatch } = this.props;
    dispatch(togglePlayerRemote());
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

  onConnectToRemotePlayer() {
    const { dispatch } = this.props;
    dispatch(connectToRemotePlayer());
  }

  onDisconnectPlayer() {
    const { dispatch } = this.props;
    dispatch(disconnect());
  }

  onCloseFsDialog() {
    this.setState({ ...this.state, fsDialogOpen: false });
  }

  onPlayerDialog() {
    const { dispatch } = this.props;
    dispatch(disconnect());
    dispatch(closePlayerLocal());
    dispatch(loadPlayerSettings());
    this.setState({ ...this.state, playerDialogOpen: false });
  }

  onClosePlayerDialog() {
    this.setState({ ...this.state, playerDialogOpen: false });
  }
  
  onReloadFsSettings() {
    const { dispatch } = this.props;
    dispatch((dispatch, getState) => {

    });
  }

  onReloadPlayerSettings() {
    const { dispatch } = this.props;
    dispatch((dispatch, getState) => {
      const {
        player: {
          playerConnected,
        },
      } = getState();

      if (playerConnected) {
        // open dialog and ask user
        this.setState({ ...this.state, playerDialogOpen: true });
      } else {
        dispatch(loadPlayerSettings());
      }
    });
  }

  render() {
    const { fsDialogOpen, playerDialogOpen } = this.state;
    return (
      <Devices
        {...this.props}
        toggleFileServerLocal={this.toggleFileServerLocal}
        openFileServerLocal={this.openFileServerLocal}
        closeFileServerLocal={this.closeFileServerLocal}
        togglePlayerLocal={this.togglePlayerLocal}
        togglePlayerRemote={this.togglePlayerRemote}
        onOpenPlayerLocal={this.onOpenPlayerLocal}
        onClosePlayerLocal={this.onClosePlayerLocal}
        onConnectToLocalPlayer={this.onConnectToLocalPlayer}
        onConnectToRemotePlayer={this.onConnectToRemotePlayer}
        onDisconnectPlayer={this.onDisconnectPlayer}
        onFsLocalHostnameChange={this.onFsLocalHostnameChange}
        onFsLocalPortChange={this.onFsLocalPortChange}
        onPlayerLocalHostnameChange={this.onPlayerLocalHostnameChange}
        onPlayerLocalPortChange={this.onPlayerLocalPortChange}
        onPlayerRemoteHostnameChange={this.onPlayerRemoteHostnameChange}
        onPlayerRemotePortChange={this.onPlayerRemotePortChange}    
        
        fsDialogOpen={fsDialogOpen}
        playerDialogOpen={playerDialogOpen}

        onCloseFsDialog={this.onCloseFsDialog}
        onPlayerDialog={this.onPlayerDialog}
        onClosePlayerDialog={this.onClosePlayerDialog}
        onReloadPlayerSettings={this.onReloadPlayerSettings}
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
