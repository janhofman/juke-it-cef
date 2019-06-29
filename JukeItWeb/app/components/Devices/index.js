import React, { Component } from 'react';
import { injectIntl, IntlProvider } from 'react-intl';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import DropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import DropUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';

import ScrollPane from '../../containers/ScrollPane';
import OrangeDivider from '../OrangeDivider';
import StyledTextField from '../StyledTextField';
import messages from './messages';

const styles = {
  grid:{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridGap: '20px',
    alignItems: 'top',
    padding: '0 10px',
  },
  fileServerDiv: {
  },
  playerDiv: {
  },
  title: {
    fontSize: '1.5em',
    margin: '0.2em 0',
    display: 'flex',
    justifyContent: 'space-between',
  },
  expansion: {
    overflow: 'hidden',
  },
  textfield: {
    marginLeft: '30px',
    maxWidth: '350px',
  },
};

class Devices extends Component {
  constructor(props) {
    super(props);
    this.transitionProps = {
      enterDelay: 0,
      transitionDuration: 450,
    };
  }

  render() {
    const {
      fileServer,
      player,
      pageLayout,
      playerConnected,
      intl,
      toggleFileServerLocal,
      openFileServerLocal,
      closeFileServerLocal,
      togglePlayerLocal,
      togglePlayerRemote,

      onOpenPlayerLocal,
      onClosePlayerLocal,
      onConnectToLocalPlayer,
      onConnectToRemotePlayer,
      onDisconnectPlayer,
      onFsLocalHostnameChange,
      onFsLocalPortChange,
      onPlayerLocalHostnameChange,
      onPlayerLocalPortChange,
      onPlayerRemoteHostnameChange,
      onPlayerRemotePortChange,

      fsDialogOpen,
      onCloseFsDialog,
      playerDialogOpen,
      onPlayerDialog,
      onClosePlayerDialog,
      onReloadPlayerSettings,
    } = this.props;
    const { formatMessage } = intl;

    // Set up button settings
    const playerLocalStartBtn = {
      disabled: player.local.busy,
      label: formatMessage(player.local.running ? messages.playerLocalStopBtn : messages.playerLocalStartBtn),
      backgroundColor: player.local.running ? '#ff2400' : '#4cbb17',
    };
    if (playerLocalStartBtn.disabled) {
      playerLocalStartBtn.onTouchTap = null;
    } else {
      playerLocalStartBtn.onTouchTap = player.local.running ? onClosePlayerLocal : onOpenPlayerLocal;
    }

    const playerLocalConnectBtn = {
      label: formatMessage(playerConnected ? messages.playerLocalDisconnectBtn : messages.playerLocalConnectBtn),
      disabled: player.local.busy,
    };
    if (playerLocalConnectBtn.disabled) {
      playerLocalConnectBtn.onTouchTap = null;
    } else {
      playerLocalConnectBtn.onTouchTap = playerConnected ? onDisconnectPlayer : onConnectToLocalPlayer;
    }
    
    const playerDialogActions = [      
      <FlatButton
        label="Yes"
        onTouchTap={onPlayerDialog}
      />,
      <FlatButton
        label="Cancel"
        onTouchTap={onClosePlayerDialog}
      />,
    ]

    return (
      <ScrollPane>
        <div style={styles.grid}>
          <div style={styles.fileServerDiv}>
            <p style={styles.title}>
              {formatMessage(messages.fileServerTitle)}
              {/*<FlatButton
              label={formatMessage(messages.fsReloadSettings)}
              onTouchTap={toggleFileServerLocal}
              />       */}       
            </p>
            <OrangeDivider />
            <FlatButton
              label={formatMessage(messages.fileServerLocal)}
              labelPosition={'before'}
              icon={pageLayout.fileServer.localOpen ? <DropUpIcon /> : <DropDownIcon />}
              onTouchTap={toggleFileServerLocal}
            />
            <ExpandTransition
              {...this.transitionProps}
              open={pageLayout.fileServer.localOpen}
            >
              <div style={styles.expansion}>
                <div style={styles.textfield}>
                  <StyledTextField
                    hintText={formatMessage(messages.fsLocalHostnameHint)}
                    floatingLabelText={formatMessage(messages.fsLocalHostnameLabel)}
                    disabled={fileServer.local.running || fileServer.local.busy}
                    onChange={onFsLocalHostnameChange}
                    value={fileServer.local.hostname}
                  />
                  <StyledTextField
                    hintText={formatMessage(messages.fsLocalPortHint)}
                    floatingLabelText={formatMessage(messages.fsLocalPortLabel)}
                    disabled={fileServer.local.running || fileServer.local.busy}
                    onChange={onFsLocalPortChange}
                    type={'number'}
                    value={fileServer.local.port}
                  />
                  <RaisedButton
                    label={formatMessage(fileServer.local.running ? messages.fsLocalStopBtn : messages.fsLocalStartBtn)}
                    backgroundColor={fileServer.local.running ? '#ff2400' : '#4cbb17'}
                    disabled={fileServer.local.busy}
                    onTouchTap={fileServer.local.running ? closeFileServerLocal : openFileServerLocal}
                  />
                </div>
              </div>
            </ExpandTransition>
            <FlatButton
              label={formatMessage(messages.fileServerRemote)}
              labelPosition={'before'}
              icon={pageLayout.fileServer.localOpen ? <DropUpIcon /> : <DropDownIcon />}
              // onTouchTap={this.toggleName.bind(this)}
            />
            <ExpandTransition
              {...this.transitionProps}
              open={pageLayout.fileServer.remoteOpen/* fsLocalOpened */}
            >
            </ExpandTransition>
          </div>

          <div style={styles.playerDiv}>
            <p style={styles.title}>
              {formatMessage(messages.playerTitle)}
              <FlatButton
              label={formatMessage(messages.playerReloadSettings)}
              onTouchTap={onReloadPlayerSettings}
              />
              <Dialog
                title="Warning"
                actions={playerDialogActions}
                modal={true}
                open={playerDialogOpen}
              >
                This action will close any open connections to Player. Do you wish to continue?
              </Dialog>
            </p>
            <OrangeDivider />
            <FlatButton
              label={formatMessage(messages.playerLocal)}
              labelPosition={'before'}
              icon={pageLayout.player.localOpen ? <DropUpIcon /> : <DropDownIcon />}
              onTouchTap={togglePlayerLocal}
            />
            <ExpandTransition
              {...this.transitionProps}
              open={pageLayout.player.localOpen}
            >
              <div style={styles.expansion}>
                <div style={styles.textfield}>
                  <StyledTextField
                    hintText={formatMessage(messages.playerLocalHostnameHint)}
                    floatingLabelText={formatMessage(messages.playerLocalHostnameLabel)}
                    disabled={player.local.running || player.local.busy}
                    onChange={onPlayerLocalHostnameChange}
                    value={player.local.hostname}
                  />
                  <StyledTextField
                    hintText={formatMessage(messages.playerLocalPortHint)}
                    floatingLabelText={formatMessage(messages.playerLocalPortLabel)}
                    disabled={player.local.running || player.local.busy}
                    onChange={onPlayerLocalPortChange}
                    type={'number'}
                    value={player.local.port}
                  />
                  <RaisedButton
                    label={playerLocalStartBtn.label}
                    backgroundColor={playerLocalStartBtn.backgroundColor}
                    disabled={playerLocalStartBtn.disabled}
                    onTouchTap={playerLocalStartBtn.onTouchTap}
                  />
                  {}
                  <FlatButton
                    label={playerLocalConnectBtn.label}
                    disabled={playerLocalConnectBtn.disabled}
                    onTouchTap={playerLocalConnectBtn.onTouchTap}
                  />
                </div>
              </div>
            </ExpandTransition>

            {/*** REMOTE PLAYER ***/}
            <FlatButton
              label={formatMessage(messages.playerRemote)}
              labelPosition={'before'}
              icon={pageLayout.player.remoteOpen ? <DropUpIcon /> : <DropDownIcon />}
              onTouchTap={togglePlayerRemote}
            />
            <ExpandTransition
              {...this.transitionProps}
              open={pageLayout.player.remoteOpen}
            >
              <div style={styles.expansion}>
                  <div style={styles.textfield}>
                    <StyledTextField
                      // hintText={formatMessage(messages.playerRemoteHostnameHint)}
                      floatingLabelText={formatMessage(messages.playerRemoteHostnameLabel)}
                      disabled={player.remote.connected}
                      onChange={onPlayerRemoteHostnameChange}
                      value={player.remote.hostname}
                    />
                    <StyledTextField
                      hintText={formatMessage(messages.playerRemotePortHint)}
                      floatingLabelText={formatMessage(messages.playerRemotePortLabel)}
                      disabled={player.remote.connected}
                      onChange={onPlayerRemotePortChange}
                      type={'number'}
                      value={player.remote.port}
                    />
                    <FlatButton
                      label={formatMessage(player.remote.connected ? messages.playerRemoteDisconnectBtn : messages.playerRemoteConnectBtn)}
                      onTouchTap={onConnectToRemotePlayer}
                    />
                  </div>
                </div>
            </ExpandTransition>
          </div>
        </div>
      </ScrollPane>
    );
  }
}

Devices.propTypes = {
  intl: PropTypes.shape(IntlProvider.propTypes.intl),
  fileServer: PropTypes.object.isRequired,
  player: PropTypes.object.isRequired,
  pageLayout: PropTypes.object.isRequired,
  playerConnected: PropTypes.bool.isRequired,

  toggleFileServerLocal: PropTypes.func.isRequired,
  openFileServerLocal: PropTypes.func.isRequired,
  closeFileServerLocal: PropTypes.func.isRequired,
  togglePlayerLocal: PropTypes.func.isRequired,
  onOpenPlayerLocal: PropTypes.func.isRequired,
  onClosePlayerLocal: PropTypes.func.isRequired,
  onDisconnectPlayer: PropTypes.func.isRequired,
  onConnectToLocalPlayer: PropTypes.func.isRequired,
  onFsLocalHostnameChange: PropTypes.func.isRequired,
  onFsLocalPortChange: PropTypes.func.isRequired,
  onPlayerLocalHostnameChange: PropTypes.func.isRequired,
  onPlayerLocalPortChange: PropTypes.func.isRequired,

  fsDialogOpen: PropTypes.bool.isRequired,
  onCloseFsDialog: PropTypes.func.isRequired,  
  playerDialogOpen: PropTypes.bool.isRequired,
  onPlayerDialog: PropTypes.func.isRequired,
  onClosePlayerDialog: PropTypes.func.isRequired,
  onReloadPlayerSettings: PropTypes.func.isRequired,
};


export default injectIntl(Devices);
