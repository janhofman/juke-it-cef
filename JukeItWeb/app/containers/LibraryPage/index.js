import React, { Component } from 'react';
import { connect } from 'react-redux';
import Library from './../../components/Library';

import {
    addSongs,
} from './../../actions/libraryActions';

class LibraryPage extends Component {

  openFile(title) {
    const { dispatch } = this.props;
    dispatch(addSongs());
  }

  render() {
    return (
      <Library
        {...this.props}
        openFile={this.openFile.bind(this)}
      />
    );
  }
}

export default connect((store) => ({
  firebase: store.firebase,
  user: store.userData.user,
  libLoading: store.library.loading,
}))(LibraryPage);
