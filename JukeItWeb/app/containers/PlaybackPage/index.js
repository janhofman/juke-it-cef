// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Playback from './../../components/Playback';
import {
    openContextMenu,
    closeContextMenu,
    removePlaylist,
    startPlayback,
    stopPlayback,
    removeQueueItem,
    toggleAvailableSongs,
    togglePlaylistQueue,
    toggleOrderQueue,
    togglePriorityQueue,
    playlistQueueAddItem,
    priorityQueueAddItem,
} from './../../actions/playbackActions';
import { toggleActive } from './../../actions/userDataActions';

class PlaybackPage extends Component {
  constructor(props) {
    super(props);

    this.startPlaying = this.startPlaying.bind(this);
    this.stopPlaying = this.stopPlaying.bind(this);
    this.onRemoveSong = this.onRemoveSong.bind(this);
    this.onToggleOrderQueue = this.onToggleOrderQueue.bind(this);
    this.onTogglePlaylistQueue = this.onTogglePlaylistQueue.bind(this);
    this.onTogglePriorityQueue = this.onTogglePriorityQueue.bind(this);
    this.onToggleSongs = this.onToggleSongs.bind(this);
    this.onSongRightClick = this.onSongRightClick.bind(this);
    this.addToPlaylistQueueOpt = this.addToPlaylistQueueOpt.bind(this);
    this.addToPriorityQueueOpt = this.addToPriorityQueueOpt.bind(this);
  }

  onSongRightClick({event, index, rowData}) {
    if (event.button === 2) {
      event.preventDefault();
      event.persist();
      const { dispatch } = this.props;
      const target = event.currentTarget;
      dispatch(openContextMenu(target, rowData.id));
    }
  }

  addToPlaylistQueueOpt() {
    const { dispatch, songId } = this.props;
    dispatch(playlistQueueAddItem(songId));
    dispatch(closeContextMenu());
  }

  addToPriorityQueueOpt() {
    const { dispatch, songId } = this.props;
    dispatch(priorityQueueAddItem(songId));
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
    dispatch(startPlayback());
  }

  stopPlaying() {
    const { dispatch } = this.props;
    dispatch(stopPlayback());
  }

  onRemoveSong(itemId) {
    const { dispatch } = this.props;
    dispatch(removeQueueItem(itemId));
  }

  onToggleSongs() {
    const { dispatch } = this.props;
    dispatch(toggleAvailableSongs());
  }

  onTogglePlaylistQueue() {
    const { dispatch } = this.props;
    dispatch(togglePlaylistQueue());
  }

  onTogglePriorityQueue() {
    const { dispatch } = this.props;
    dispatch(togglePriorityQueue());
  }

  onToggleOrderQueue() {
    const { dispatch } = this.props;
    dispatch(toggleOrderQueue());
  }

  render() {
    return (
      <Playback
        {...this.props}
        onSongRightClick={this.onSongRightClick}
        addToPlaylistQueueOpt={this.addToPlaylistQueueOpt}
        addToPriorityQueueOpt={this.addToPriorityQueueOpt}
        handleCloseContextMenu={this.handleCloseContextMenu.bind(this)}
        toggleActive={this.toggleActive.bind(this)}
        removePlaylist={this.removePlaylist.bind(this)}
        startPlaying={this.startPlaying}
        stopPlaying={this.stopPlaying}
        onRemoveSong={this.onRemoveSong}
        onToggleSongs={this.onToggleSongs}
        onTogglePlaylistQueue={this.onTogglePlaylistQueue}
        onTogglePriorityQueue={this.onTogglePriorityQueue}
        onToggleOrderQueue={this.onToggleOrderQueue}
      />
    );
  }
}

PlaybackPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  playlistQueue: PropTypes.array.isRequired,
  orderQueue: PropTypes.array.isRequired,
  priorityQueue: PropTypes.array.isRequired,
  orderQueueOpen: PropTypes.bool.isRequired,
  playlistQueueOpen: PropTypes.bool.isRequired,
  priorityQueueOpen: PropTypes.bool.isRequired,
  availableSongsOpen: PropTypes.bool.isRequired,
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
    playerEnabled: player.initialized,
    playlistQueue: playback.playlistQueue,
    orderQueue: playback.orderQueue,
    priorityQueue: playback.priorityQueue,
    orderQueueOpen: playback.orderQueueOpen,
    playlistQueueOpen: playback.playlistQueueOpen,
    priorityQueueOpen: playback.priorityQueueOpen,
    availableSongsOpen: playback.availableSongsOpen,
  });
})(PlaybackPage);
