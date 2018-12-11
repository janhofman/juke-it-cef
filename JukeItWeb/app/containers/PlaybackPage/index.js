// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Playback from './../../components/Playback';
import {
    addToEndOfQueue,
    openContextMenu,
    closeContextMenu,
    removePlaylist,
} from './../../actions/playbackActions';
import { toggleActive } from './../../actions/userDataActions';
import { play } from './../../actions/playerActions';

class PlaybackPage extends Component {
  constructor(props) {
    super(props);

    this.startPlaying = this.startPlaying.bind(this);
  }
  onSongDoubleClick(songId) {
    this.props.dispatch(addToEndOfQueue(songId));
  }

  songOnMouseUp(event, songId) {
    if (event.button === 2) {
      event.preventDefault();
      event.persist();
      const { dispatch } = this.props;
      const target = event.currentTarget;
      dispatch(openContextMenu(target, songId));
    }
  }

  addSongToQueueAction() {
    const { dispatch, songId } = this.props;
    dispatch(addToEndOfQueue(songId));
    dispatch(closeContextMenu());
  }

  handleCloseContextMenu() {
    const { dispatch } = this.props;
    dispatch(closeContextMenu());
  }

  toggleActive() {
    const { dispatch } = this.props;
    dispatch(toggleActive());
  }

  removePlaylist() {
    const { dispatch } = this.props;
    dispatch(removePlaylist());
  }

  startPlaying() {
    const { dispatch } = this.props;
    dispatch(play());
  }

  render() {
    return (
      <Playback
        {...this.props}
        onSongDoubleClick={this.onSongDoubleClick.bind(this)}
        songOnMouseUp={this.songOnMouseUp.bind(this)}
        addSongToQueueAction={this.addSongToQueueAction.bind(this)}
        handleCloseContextMenu={this.handleCloseContextMenu.bind(this)}
        toggleActive={this.toggleActive.bind(this)}
        removePlaylist={this.removePlaylist.bind(this)}
        startPlaying={this.startPlaying}
      />
    );
  }
}

PlaybackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect((store) => {
  const { playback, firebase, userData, player } = store;
  return ({
    firebase,
    playlist: playback.activePlaylist,
    contextMenuAnchor: playback.contextMenuAnchor,
    contextMenuOpen: playback.contextMenuOpen,
    songId: playback.songId,
    active: userData.spot.active,
    playerEnabled: !!player.currentSong,
  });
})(PlaybackPage);
