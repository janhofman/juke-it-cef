import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Devices from '../../components/Devices';
import {
  toggleFileServerLocal,
  openFileServerLocal,
  closeFileServerLocal,
} from '../../actions/devicesActions';

class DevicesPage extends Component {
  constructor(props) {
    super(props);

    this.toggleFileServerLocal = this.toggleFileServerLocal.bind(this);
    this.openFileServerLocal = this.openFileServerLocal.bind(this);
    this.closeFileServerLocal = this.closeFileServerLocal.bind(this);
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


  render() {
    return (
      <Devices
        {...this.props}
        toggleFileServerLocal={this.toggleFileServerLocal}
        openFileServerLocal={this.openFileServerLocal}
        closeFileServerLocal={this.closeFileServerLocal}
      />
    );
  }
}

DevicesPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect((store) => {
  const { devices } = store;
  const { fileServer, player, pageLayout } = devices;
  return ({
    fileServer,
    player,
    pageLayout,
  });
})(DevicesPage);
