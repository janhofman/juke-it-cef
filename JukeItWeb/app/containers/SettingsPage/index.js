import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Settings from './../../components/Settings';

import {
  fsLocalChange,
  fsRemoteChange,
  playerLocalChange,
  playerRemoteChange,
  save as saveSettings,
} from '../../actions/settingsActions';

class SettingsPage extends Component {
  constructor(props) {
    super(props);
        
    this.onFsLocalChange = this.onFsLocalChange.bind(this);
    this.onFsRemoteChange = this.onFsRemoteChange.bind(this);
    this.onPlayerLocalChange = this.onPlayerLocalChange.bind(this);
    this.onPlayerRemoteChange = this.onPlayerRemoteChange.bind(this);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(saveSettings());
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

  render() {
    return (
      <Settings
        {...this.props}
        onFsLocalChange={this.onFsLocalChange}
        onFsRemoteChange={this.onFsRemoteChange}
        onPlayerLocalChange={this.onPlayerLocalChange}
        onPlayerRemoteChange={this.onPlayerRemoteChange}       
      />
    );
  }
}

SettingsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  player: PropTypes.object.isRequired,
  fileServer: PropTypes.object.isRequired,
};

export default connect((store) => {
  const { settings } = store;
  return ({
    ...settings
  });
})(SettingsPage);

