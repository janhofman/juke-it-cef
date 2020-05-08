import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Library from './../../components/Library';

import {
    addSongs,
} from './../../actions/libraryActions';
import { loadPlaylists } from './../../actions/playlistsActions';

class LibraryPage extends Component {
  constructor(props) {
    super(props);
    props.dispatch(loadPlaylists());

    this.handleAddFiles = this.handleAddFiles.bind(this);
    this.handleOpenFileAvailabilityTool = this.handleOpenFileAvailabilityTool.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { playlistsLoaded, dispatch } = this.props;
    if (nextProps.playlistsLoaded === false && playlistsLoaded === true) {
      dispatch(loadPlaylists());
    }
  }

  handleAddFiles(title) {
    const { dispatch } = this.props;
    dispatch(addSongs());
  }

  handleOpenFileAvailabilityTool() {
    const { dispatch } = this.props;
    dispatch(push('/home/fileAvailabilityTool'));
  }

  render() {
    return (
      <Library
        {...this.props}
        onAddFiles={this.handleAddFiles}
        onOpenFileAvailabilityTool={this.handleOpenFileAvailabilityTool}
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
