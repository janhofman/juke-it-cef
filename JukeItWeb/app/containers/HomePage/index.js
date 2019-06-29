import React, { Component } from 'react';
import { connect } from 'react-redux';
import {push} from 'react-router-redux';

import {Home} from './../../components';
import {logOut} from './../../actions/loginActions';

class HomePage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  logout(){
    const { dispatch } = this.props;
    dispatch(push('/'));
    dispatch(logOut());
  }

  render() {
    return (
      <Home 
        {...this.props}
        logOut={this.logout.bind(this)}
      />
    );
  }
}

export default connect((store) => {
  return({
  });
})(HomePage)