import React, { Component } from 'react';
import { injectIntl, IntlProvider } from 'react-intl';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import RaisedButton from 'material-ui/RaisedButton';

import ScrollPane from '../../containers/ScrollPane';
import OrangeDivider from '../OrangeDivider';
import StyledTextField from '../StyledTextField';
import messages from './messages';

const styles = {
  fileServerDiv: {
    float: 'left',
    width: '40%',
    marginLeft: '10px',
  },
  playerDiv: {
    float: 'right',
    width: '55%',
    marginRight: '10px',
  },
  yellow: {
    color: '#FFA3B6',
  },
  title: {
    fontSize: '1.5em',
    margin: '0.2em 0',
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

      onOpenPlayerLocal,
      onClosePlayerLocal,
      onConnectToLocalPlayer,
      onDisconnectPlayer,
      onFsLocalHostnameChange,
      onFsLocalPortChange,
      onPlayerLocalHostnameChange,
      onPlayerLocalPortChange,
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

    return (
      <ScrollPane>
        <div style={styles.fileServerDiv}>
          <p style={styles.title}>
            {formatMessage(messages.fileServerTitle)}
          </p>
          <OrangeDivider />
          <FlatButton
            label={formatMessage(messages.fileServerLocal)}
            // labelPosition={'after'}
            // icon={<Star />}
            // style={{}}
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
            // labelPosition={'after'}
            // icon={<Star />}
            // style={{}}
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
          </p>
          <OrangeDivider />
          <FlatButton
            label={formatMessage(messages.playerLocal)}
            labelPosition={'after'}
            // icon={<Star />}
            // style={{}}
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
                <FlatButton
                  label={playerLocalConnectBtn.label}
                  disabled={playerLocalConnectBtn.disabled}
                  onTouchTap={playerLocalConnectBtn.onTouchTap}
                />
              </div>
            </div>
          </ExpandTransition>
          <FlatButton
            label={formatMessage(messages.playerRemote)}
            labelPosition={'after'}
            // icon={<Star />}
            // style={{}}
            // onTouchTap={this.toggleName.bind(this)}
          />
          <ExpandTransition
            {...this.transitionProps}
            open={pageLayout.player.remoteOpen}
          >
          </ExpandTransition>
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
};


export default injectIntl(Devices);
