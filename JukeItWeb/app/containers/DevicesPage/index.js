import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Devices from '../../components/Devices';
import {
  toggleFileServerLocal,
  toggleFileServerRemote,
  openFileServerLocal,
  closeFileServerLocal,
  togglePlayerLocal,
  togglePlayerRemote,
  openPlayerLocal,
  closePlayerLocal,
  fsLocalChange,
  fsRemoteChange,
  playerLocalChange,
  playerRemoteChange,
  loadPlayerSettings,
  loadFileServerSettings,
  toggleFsDialog,
  togglePlayerDialog,
  disconnectFileServer,
  connectFsLocal,
  connectFsRemote,
} from '../../actions/devicesActions';
import {
  connectToLocalPlayer,
  connectToRemotePlayer,
  disconnect as disconnectPlayer,
} from '../../actions/playerActions';
import { notify, logError } from '../../actions/evenLogActions';
import messages from './messages';
 
class DevicesPage extends Component {
  constructor(props) {
    super(props);

    this.onFsLocalChange = this.onFsLocalChange.bind(this);
    this.onFsRemoteChange = this.onFsRemoteChange.bind(this);
    this.toggleFileServerLocal = this.toggleFileServerLocal.bind(this);
    this.toggleFileServerRemote = this.toggleFileServerRemote.bind(this);
    this.openFileServerLocal = this.openFileServerLocal.bind(this);
    this.closeFileServerLocal = this.closeFileServerLocal.bind(this);
    this.onCloseFsDialog = this.onCloseFsDialog.bind(this);
    this.onReloadFsSettings = this.onReloadFsSettings.bind(this);    
    this.onFsDialogConfirm = this.onFsDialogConfirm.bind(this);   
    this.onConnectToLocalFileServer = this.onConnectToLocalFileServer.bind(this);
    this.onConnectToRemoteFileServer = this.onConnectToRemoteFileServer.bind(this);
    this.onDisconnectFileServer = this.onDisconnectFileServer.bind(this);
    
    this.onPlayerLocalChange = this.onPlayerLocalChange.bind(this);
    this.onPlayerRemoteChange = this.onPlayerRemoteChange.bind(this);
    this.togglePlayerLocal = this.togglePlayerLocal.bind(this);
    this.togglePlayerRemote = this.togglePlayerRemote.bind(this);
    this.onOpenPlayerLocal = this.onOpenPlayerLocal.bind(this);
    this.onClosePlayerLocal = this.onClosePlayerLocal.bind(this);
    this.onConnectToLocalPlayer = this.onConnectToLocalPlayer.bind(this);
    this.onConnectToRemotePlayer = this.onConnectToRemotePlayer.bind(this);
    this.onDisconnectPlayer = this.onDisconnectPlayer.bind(this);
    this.onPlayerDialog = this.onPlayerDialog.bind(this);
    this.onClosePlayerDialog = this.onClosePlayerDialog.bind(this);
    this.onReloadPlayerSettings = this.onReloadPlayerSettings.bind(this);
  }

  onFsLocalChange(changes) {
    const { 
      dispatch,      
      fileServer: {
        local,
      },
    } = this.props;
    const updates = { ...local, ...changes };
    dispatch(fsLocalChange(updates));
  }

  onFsRemoteChange(changes) {
    const { 
      dispatch,      
      fileServer: {
        remote,
      },
    } = this.props;
    const updates = { ...remote, ...changes };
    dispatch(fsRemoteChange(updates));
  }  

  toggleFileServerLocal() {
    const { dispatch } = this.props;
    dispatch(toggleFileServerLocal());
  }

  toggleFileServerRemote() {
    const { dispatch } = this.props;
    dispatch(toggleFileServerRemote());
  }

  openFileServerLocal() {
    const { dispatch } = this.props;
    dispatch(openFileServerLocal());
  }

  closeFileServerLocal() {
    const { dispatch } = this.props;
    dispatch(closeFileServerLocal());
  }

  onReloadFsSettings() {
    const { dispatch } = this.props;
    dispatch((dispatch, getState) => {
      const {
        devices: {
          fileServer: {
            connected,
          },
        },
      } = getState();

      if (connected) {
        // open dialog and ask user
        dispatch(toggleFsDialog(true));
      } else {
        dispatch(loadFileServerSettings());
      }
    });
  }

  onFsDialogConfirm() {
    const { dispatch } = this.props;
    dispatch(disconnectFileServer());
    dispatch(closeFileServerLocal());
    dispatch(loadFileServerSettings());    
    dispatch(toggleFsDialog(false));
  }

  onCloseFsDialog() {
    const { dispatch } = this.props;
    dispatch(toggleFsDialog(false));
  }

  onConnectToLocalFileServer() {
    const { dispatch } = this.props;
    dispatch(connectFsLocal());
  }

  onConnectToRemoteFileServer() {
    const { dispatch, intl: { formatMessage } } = this.props;
    dispatch(connectFsRemote())
      .catch((error) => {
        dispatch(logError(error));
        dispatch(notify(formatMessage(messages.fsConnectErr)));
    });
  }

  onDisconnectFileServer() {
    const { dispatch } = this.props;
    dispatch(disconnectFileServer());
  }

  /****************** PLAYER ******************/
  onPlayerLocalChange(changes) {
    const { 
      dispatch,      
      player: {
        local,
      },
    } = this.props;
    const updates = { ...local, ...changes };
    dispatch(playerLocalChange(updates));
  }

  onPlayerRemoteChange(changes) {
    const { 
      dispatch,      
      player: {
        remote,
      },
    } = this.props;
    const updates = { ...remote, ...changes };
    dispatch(playerRemoteChange(updates));
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
    dispatch(connectToLocalPlayer())
      .catch((error) => {
        dispatch(logError(error));
        dispatch(notify(formatMessage(messages.playerConnectErr)));
    });
  }

  onConnectToRemotePlayer() {
    const { dispatch, intl: { formatMessage } } = this.props;
    dispatch(connectToRemotePlayer())
      .catch((error) => {
        dispatch(logError(error));
        dispatch(notify(formatMessage(messages.playerConnectErr)));
      });
  }

  onDisconnectPlayer() {
    const { dispatch } = this.props;
    dispatch(disconnectPlayer());
  }

  onPlayerDialog() {
    const { dispatch } = this.props;
    dispatch(disconnectPlayer());
    dispatch(closePlayerLocal());
    dispatch(loadPlayerSettings());    
    dispatch(togglePlayerDialog(false));
  }

  onClosePlayerDialog() {    
    const { dispatch } = this.props;
    dispatch(togglePlayerDialog(false));
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
        dispatch(togglePlayerDialog(true));
      } else {
        dispatch(loadPlayerSettings());
      }
    });
  }

  render() {
    const playerSettings = {
      toggleLocal: this.togglePlayerLocal,
      toggleRemote: this.togglePlayerRemote,
      onOpenLocal: this.onOpenPlayerLocal,
      onCloseLocal: this.onClosePlayerLocal,
      onReloadSettings: this.onReloadPlayerSettings,
      onDialogConfirm: this.onPlayerDialog,
      onDialogCancel: this.onClosePlayerDialog,
      onRemoteChange: this.onPlayerRemoteChange,
      onLocalChange: this.onPlayerLocalChange,
      onConnectLocal: this.onConnectToLocalPlayer,
      onConnectRemote: this.onConnectToRemotePlayer,
      onDisconnect: this.onDisconnectPlayer,
    }

    const fileServerSettings = {
      toggleLocal: this.toggleFileServerLocal,
      toggleRemote: this.toggleFileServerRemote,
      onOpenLocal: this.openFileServerLocal,
      onCloseLocal: this.closeFileServerLocal,
      onReloadSettings: this.onReloadFsSettings,
      onDialogConfirm: this.onFsDialogConfirm,
      onDialogCancel: this.onCloseFsDialog,
      onRemoteChange: this.onFsRemoteChange,
      onLocalChange: this.onFsLocalChange,
      onConnectLocal: this.onConnectToLocalFileServer,
      onConnectRemote: this.onConnectToRemoteFileServer,
      onDisconnect: this.onDisconnectFileServer,
    }

    return (
      <Devices
        {...this.props}
        playerSettings={playerSettings}
        fileServerSettings={fileServerSettings}
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
})(injectIntl(DevicesPage));
