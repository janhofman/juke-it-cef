import React, { Component } from 'react';
import { IntlProvider } from 'react-intl';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import ExpandTransition from 'material-ui/internal/ExpandTransition';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import DropDownIcon from 'material-ui/svg-icons/navigation/arrow-drop-down';
import DropUpIcon from 'material-ui/svg-icons/navigation/arrow-drop-up';
import BeadIcon from 'material-ui/svg-icons/image/brightness-1';

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
    alignItems: 'center',
  },
  expansion: {
    overflow: 'hidden',
  },
  textfield: {
    marginLeft: '30px',
    maxWidth: '350px',
  },
  toggleWrapper: {
    display: 'flex',
    alignItems: 'center',
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
    const orange = '#ffa500';

    // Set up button settings
    /*** LOCAL PLAYER START BUTTON ***/
    const playerLocalStartBtn = {
      disabled: player.local.busy,
      label: formatMessage(player.local.running ? messages.playerLocalStopBtn : messages.playerLocalStartBtn),
      backgroundColor: player.local.running ? red : green,
    };
    playerLocalStartBtn.onTouchTap = playerLocalStartBtn.disabled 
      ? null 
      : (player.local.running ? ps.onCloseLocal : ps.onOpenLocal);
    /*** LOCAL PLAYER CONNECT BUTTON */
    const playerLocalConnectBtn = {
      disabled: player.remote.connected || !player.local.running,
      label: formatMessage(player.local.connected ? messages.playerLocalDisconnectBtn : messages.playerLocalConnectBtn)
    };
    playerLocalConnectBtn.onTouchTap = playerLocalConnectBtn.disabled 
      ? null
      : (player.local.connected ? ps.onDisconnect : ps.onConnectLocal);
    /*** REMOTE PLAYER CONNECT BUTTON */
    const playerRemoteConnectBtn = {
      disabled: player.local.connected,
      label: formatMessage(player.remote.connected ? messages.playerRemoteDisconnectBtn : messages.playerRemoteConnectBtn)
    };
    playerRemoteConnectBtn.onTouchTap = playerRemoteConnectBtn.disabled 
      ? null
      : (player.remote.connected ? ps.onDisconnect : ps.onConnectRemote);
    /*** LOCAL FILESERVER START BUTTON ***/
    const fsLocalStartBtn = {
      disabled: fileServer.local.busy,
      label: formatMessage(fileServer.local.running ? messages.fsLocalStopBtn : messages.fsLocalStartBtn),
      backgroundColor: fileServer.local.running ? red : green,
    };
    fsLocalStartBtn.onTouchTap = fsLocalStartBtn.disabled 
      ? null 
      : (fileServer.local.running ? fs.onCloseLocal : fs.onOpenLocal);
    /*** LOCAL FILESERVER CONNECT BUTTON ***/
    const fsLocalConnectBtn = {
      disabled: fileServer.remote.connected || !fileServer.local.running,
      label: formatMessage(fileServer.local.connected ? messages.fsLocalDisconnectBtn : messages.fsLocalConnectBtn)
    };
    fsLocalConnectBtn.onTouchTap = fsLocalConnectBtn.disabled 
      ? null
      : (fileServer.local.connected ? fs.onDisconnect : fs.onConnectLocal);
    /*** REMOTE FILESERVER CONNECT BUTTON ***/
    const fsRemoteConnectBtn = {
      disabled: fileServer.local.connected,
      label: formatMessage(fileServer.remote.connected ? messages.fsRemoteDisconnectBtn : messages.fsRemoteConnectBtn)
    };
    fsRemoteConnectBtn.onTouchTap = fsRemoteConnectBtn.disabled 
      ? null
      : (fileServer.remote.connected ? fs.onDisconnect : fs.onConnectRemote);

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
                title={formatMessage(messages.fsDialogTitle)}
                actions={fsDialogActions}
                modal={true}
                open={pageLayout.fileServer.dialogOpen}
              >
                {formatMessage(messages.fsDialogBody)}                
              </Dialog>    
            </p>
            <OrangeDivider />

{/*********** LOCAL FILE SERVER ***********/}
            <div style={styles.toggleWrapper}>
              <BeadIcon color={fileServer.local.connected ? green : (fileServer.local.running ? orange : red)}/>
              <FlatButton
                label={formatMessage(messages.fileServerLocal)}
                labelPosition={'before'}
                icon={pageLayout.fileServer.localOpen ? <DropUpIcon /> : <DropDownIcon />}
                onTouchTap={fs.toggleLocal}
              />
            </div>
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
                    label={fsLocalStartBtn.label}
                    backgroundColor={fsLocalStartBtn.backgroundColor}
                    disabled={fsLocalStartBtn.disabled}
                    onTouchTap={fsLocalStartBtn.onTouchTap}
                  />                    
                  <FlatButton
                    disabled={fsLocalConnectBtn.disabled}
                    label={fsLocalConnectBtn.label}
                    onTouchTap={fsLocalConnectBtn.onTouchTap}
                  />
                </div>
              </div>
            </ExpandTransition>

{/*********** REMOTE FILE SERVER ***********/}
            <div style={styles.toggleWrapper}>
              <BeadIcon color={fileServer.remote.connected ? green : red}/>
              <FlatButton
                label={formatMessage(messages.fileServerRemote)}
                labelPosition={'before'}
                icon={pageLayout.fileServer.remoteOpen ? <DropUpIcon /> : <DropDownIcon />}
                onTouchTap={fs.toggleRemote}
              />
            </div>
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
                    label={fsRemoteConnectBtn.label}
                    onTouchTap={fsRemoteConnectBtn.onTouchTap}
                    disabled={fsRemoteConnectBtn.disabled}
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
                title={formatMessage(messages.playerDialogTitle)}
                actions={playerDialogActions}
                modal={true}
                open={pageLayout.player.dialogOpen}
              >
                {formatMessage(messages.playerDialogBody)}                
              </Dialog>
            </p>
            <OrangeDivider />

{/*********** LOCAL PLAYER ***********/}
            <div style={styles.toggleWrapper}>
              <BeadIcon color={player.local.connected ? green : (player.local.running ? orange : red)}/>
              <FlatButton
                label={formatMessage(messages.playerLocal)}
                labelPosition={'before'}
                icon={pageLayout.player.localOpen ? <DropUpIcon /> : <DropDownIcon />}
                onTouchTap={ps.toggleLocal}
              />
            </div>
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
                  <FlatButton
                    label={playerLocalConnectBtn.label}
                    onTouchTap={playerLocalConnectBtn.onTouchTap}
                    disabled={playerLocalConnectBtn.disabled}
                  />
                </div>
              </div>
            </ExpandTransition>

{/*********** REMOTE PLAYER ***********/}
            <div style={styles.toggleWrapper}>
              <BeadIcon color={player.remote.connected ? green : red}/>
              <FlatButton
                label={formatMessage(messages.playerRemote)}
                labelPosition={'before'}
                icon={pageLayout.player.remoteOpen ? <DropUpIcon /> : <DropDownIcon />}
                onTouchTap={ps.toggleRemote}
              />
            </div>
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
                      label={playerRemoteConnectBtn.label}
                      onTouchTap={playerRemoteConnectBtn.onTouchTap}
                      disabled={playerRemoteConnectBtn.disabled}
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


export default Devices;
