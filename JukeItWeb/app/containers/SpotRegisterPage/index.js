import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { addFirebaseListeners, logOut } from '../../actions/loginActions';
import {
  setSpotId,
  spotUpdate,
} from './../../actions/userDataActions';
import SpotRegister from '../../components/SpotRegister';

class SpotRegisterPage extends Component {
  constructor(props) {
    super(props);
    this.registerSpot = this.registerSpot.bind(this);
    this.cancelRegistration = this.cancelRegistration.bind(this);
  }

  registerSpot(publicSpotData, privateSpotData) {
    const { firebase, dispatch, userId } = this.props;
    dispatch((dispatch) => {
      const newSpotKey = firebase.database().ref('spots/public').push().key;
      dispatch(setSpotId(newSpotKey));
      const data = {};
      data[`spots/public/${newSpotKey}`] = publicSpotData;
      data[`spots/private/${newSpotKey}`] = privateSpotData;
      data[`users/private/${userId}/adminForSpot`] = newSpotKey;
      firebase.database()
        .ref()
        .update(data)
        .catch((error) => console.log(error));
      dispatch(spotUpdate(publicSpotData));
      dispatch(spotUpdate(privateSpotData));
      dispatch(addFirebaseListeners(userId, newSpotKey));
      dispatch(push('/home'));
    });
  }

  cancelRegistration() {
    const { dispatch } = this.props;
    dispatch((dispatch) => {
      dispatch(push('/'));
      dispatch(logOut());
    });
  }

  render() {
    return (
      <SpotRegister
        {...this.props}
        registerSpot={this.registerSpot}
        cancelRegistration={this.cancelRegistration}
      />
    );
  }
}

SpotRegisterPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default connect((store) => ({
  firebase: store.firebase,
  userId: store.userData.userId,
}))(SpotRegisterPage);
