import React, { Component } from 'react';
import { connect } from 'react-redux';
import Library from './../../components/Library';

import {
    addSongs,
} from './../../actions/libraryActions';
import { loadPlaylists } from './../../actions/playlistsActions';

class LibraryPage extends Component {
  constructor(props) {
    super(props);
    props.dispatch(loadPlaylists());
  }

  componentWillReceiveProps(nextProps) {
    const { playlistsLoaded, dispatch } = this.props;
    if (nextProps.playlistsLoaded === false && playlistsLoaded === true) {
      dispatch(loadPlaylists());
    }
  }

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
  playlistsLoaded: store.playlists.playlistsLoaded,
  playbackReady: store.playback.activePlaylist !== null,
  localConnected: store.devices.fileServer.local.connected,
}))(LibraryPage);
