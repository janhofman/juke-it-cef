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
      intl,
      toggleFileServerLocal,
      openFileServerLocal,
      closeFileServerLocal,
    } = this.props;
    const { formatMessage } = intl;
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
                  // onChange={this.onNameChange.bind(this)}
                  value={fileServer.local.hostname}
                />
                <StyledTextField
                  hintText={formatMessage(messages.fsLocalPortHint)}
                  floatingLabelText={formatMessage(messages.fsLocalPortLabel)}
                  disabled={fileServer.local.running || fileServer.local.busy}
                  // onChange={this.onNameChange.bind(this)}
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
            // onTouchTap={this.toggleName.bind(this)}
          />
          <ExpandTransition
            {...this.transitionProps}
            open={pageLayout.player.localOpen}
          >
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

  toggleFileServerLocal: PropTypes.func.isRequired,
  openFileServerLocal: PropTypes.func.isRequired,
  closeFileServerLocal: PropTypes.func.isRequired,
};


export default injectIntl(Devices);
