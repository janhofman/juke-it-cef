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
      intl: {
        formatMessage,
      },
      playerSettings: ps,
      fileServerSettings: fs,
    } = this.props;

    const green = '#4cbb17';
    const red = '#ff2400';

    // Set up button settings
    const playerLocalStartBtn = {
      disabled: player.local.busy,
      label: formatMessage(player.local.running ? messages.playerLocalStopBtn : messages.playerLocalStartBtn),
      backgroundColor: player.local.running ? red : green,
    };
    playerLocalStartBtn.onTouchTap = playerLocalStartBtn.disabled 
      ? null 
      : (player.local.running ? ps.onCloseLocal : ps.onOpenLocal);
    
    const playerDialogActions = [      
      <FlatButton
        label="Yes"
        onTouchTap={ps.onDialogConfirm}
      />,
      <FlatButton
        label="Cancel"
        onTouchTap={ps.onDialogCancel}
      />,
    ]

    const fsDialogActions = [      
      <FlatButton
        label="Yes"
        onTouchTap={fs.onDialogConfirm}
      />,
      <FlatButton
        label="Cancel"
        onTouchTap={fs.onDialogCancel}
      />,
    ]

    return (
      <ScrollPane>
        <div style={styles.grid}>
{/*********** FILE SERVER ***********/}
          <div style={styles.fileServerDiv}>
            <p style={styles.title}>
              {formatMessage(messages.fileServerTitle)}
              <FlatButton
                label={formatMessage(messages.fsReloadSettings)}
                onTouchTap={fs.onReloadSettings}
              />
              <Dialog
                title="Warning"
                actions={fsDialogActions}
                modal={true}
                open={pageLayout.fileServer.dialogOpen}
              >
                This action will close any open connections to File Server. Do you wish to continue?
              </Dialog>    
            </p>
            <OrangeDivider />

{/*********** LOCAL FILE SERVER ***********/}
            <FlatButton
              label={formatMessage(messages.fileServerLocal)}
              labelPosition={'before'}
              icon={pageLayout.fileServer.localOpen ? <DropUpIcon /> : <DropDownIcon />}
              onTouchTap={fs.toggleLocal}
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
                    onChange={(event) => fs.onLocalChange({hostname: event.target.value})}
                    value={fileServer.local.hostname}
                  />
                  <StyledTextField
                    hintText={formatMessage(messages.fsLocalPortHint)}
                    floatingLabelText={formatMessage(messages.fsLocalPortLabel)}
                    disabled={fileServer.local.running || fileServer.local.busy}
                    onChange={(event) => fs.onLocalChange({port: event.target.value})}
                    type={'number'}
                    value={fileServer.local.port}
                  />
                  <RaisedButton
                    label={formatMessage(fileServer.local.running ? messages.fsLocalStopBtn : messages.fsLocalStartBtn)}
                    backgroundColor={fileServer.local.running ? red : green}
                    disabled={fileServer.local.busy}
                    onTouchTap={fileServer.local.running ? fs.onCloseLocal : fs.onOpenLocal}
                  />
                  {
                    fileServer.local.running && !fileServer.connected && (
                      <FlatButton
                        label={formatMessage(messages.fsLocalReconnectBtn)}
                        onTouchTap={fs.onConnectLocal}
                      />
                    )
                  }
                </div>
              </div>
            </ExpandTransition>

{/*********** REMOTE FILE SERVER ***********/}
            <FlatButton
              label={formatMessage(messages.fileServerRemote)}
              labelPosition={'before'}
              icon={pageLayout.fileServer.remoteOpen ? <DropUpIcon /> : <DropDownIcon />}
              onTouchTap={fs.toggleRemote}
            />
            <ExpandTransition
              {...this.transitionProps}
              open={pageLayout.fileServer.remoteOpen}
            >
              <div style={styles.expansion}>
                <div style={styles.textfield}>
                  <StyledTextField
                    // hintText={formatMessage(messages.playerRemoteHostnameHint)}
                    floatingLabelText={formatMessage(messages.fsRemoteHostnameLabel)}
                    disabled={fileServer.remote.connected}
                    onChange={(event) => fs.onRemoteChange({hostname: event.target.value})}
                    value={fileServer.remote.hostname}
                  />
                  <StyledTextField
                    hintText={formatMessage(messages.fsRemotePortHint)}
                    floatingLabelText={formatMessage(messages.fsRemotePortLabel)}
                    disabled={fileServer.remote.connected}
                    onChange={(event) => fs.onRemoteChange({port: event.target.value})}
                    type={'number'}
                    value={fileServer.remote.port}
                  />
                  <FlatButton
                    label={formatMessage(fileServer.remote.connected ? messages.fsRemoteDisconnectBtn : messages.fsRemoteConnectBtn)}
                    onTouchTap={fileServer.remote.connected ? fs.onConnectRemote : fs.onDisconnect}
                  />
                </div>
              </div>
            </ExpandTransition>
          </div>

{/*********** PLAYER ***********/}
          <div style={styles.playerDiv}>
            <p style={styles.title}>
              {formatMessage(messages.playerTitle)}
              <FlatButton
              label={formatMessage(messages.playerReloadSettings)}
              onTouchTap={ps.onReloadSettings}
              />
              <Dialog
                title="Warning"
                actions={playerDialogActions}
                modal={true}
                open={pageLayout.player.dialogOpen}
              >
                This action will close any open connections to Player. Do you wish to continue?
              </Dialog>
            </p>
            <OrangeDivider />

{/*********** LOCAL PLAYER ***********/}
            <FlatButton
              label={formatMessage(messages.playerLocal)}
              labelPosition={'before'}
              icon={pageLayout.player.localOpen ? <DropUpIcon /> : <DropDownIcon />}
              onTouchTap={ps.toggleLocal}
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
                    onChange={(event) => ps.onLocalChange({hostname: event.target.value})}
                    value={player.local.hostname}
                  />
                  <StyledTextField
                    hintText={formatMessage(messages.playerLocalPortHint)}
                    floatingLabelText={formatMessage(messages.playerLocalPortLabel)}
                    disabled={player.local.running || player.local.busy}
                    onChange={(event) => ps.onLocalChange({port: event.target.value})}
                    type={'number'}
                    value={player.local.port}
                  />
                  <RaisedButton
                    label={playerLocalStartBtn.label}
                    backgroundColor={playerLocalStartBtn.backgroundColor}
                    disabled={playerLocalStartBtn.disabled}
                    onTouchTap={playerLocalStartBtn.onTouchTap}
                  />
                  {
                    player.local.running && !playerConnected && (
                      <FlatButton
                        label={formatMessage(messages.playerLocalReconnectBtn)}
                        onTouchTap={ps.onConnectLocal}
                      />
                    )
                  }
                </div>
              </div>
            </ExpandTransition>

{/*********** REMOTE PLAYER ***********/}
            <FlatButton
              label={formatMessage(messages.playerRemote)}
              labelPosition={'before'}
              icon={pageLayout.player.remoteOpen ? <DropUpIcon /> : <DropDownIcon />}
              onTouchTap={ps.toggleRemote}
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
                      onChange={(event) => ps.onRemoteChange({hostname: event.target.value})}
                      value={player.remote.hostname}
                    />
                    <StyledTextField
                      hintText={formatMessage(messages.playerRemotePortHint)}
                      floatingLabelText={formatMessage(messages.playerRemotePortLabel)}
                      disabled={player.remote.connected}
                      onChange={(event) => ps.onRemoteChange({port: event.target.value})}
                      type={'number'}
                      value={player.remote.port}
                    />
                    <FlatButton
                      label={formatMessage(player.remote.connected ? messages.playerRemoteDisconnectBtn : messages.playerRemoteConnectBtn)}
                      onTouchTap={player.remote.connected ? ps.onDisconnect : ps.onConnectRemote}
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
  playerSettings: PropTypes.object.isRequired,
  fileServerSettings: PropTypes.object.isRequired,
};


export default injectIntl(Devices);
