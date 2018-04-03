import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SongListDumb from '../SongListDumb';
import { loadPlaylists, addSongsToPlaylist } from './../../actions/playlistsActions';
import {
  makeSelectable,
  makeStatic,
  openOptions,
  closeOptions,
  selectionChanged,
  openContextMenu,
  closeContextMenu,
} from './../../actions/songListActions';
import { addToEndOfQueue } from './../../actions/playbackActions';

class SongList extends Component {
  constructor(props) {
    super(props);
    props.dispatch(loadPlaylists());
  }

  componentWillReceiveProps(nextProps) {
    console.log('WillReceiveProps');
    const { playlistsLoaded, dispatch } = this.props;
    if (nextProps.playlistsLoaded === false && playlistsLoaded === true) {
      console.log('Called update');
      dispatch(loadPlaylists());
    }
  }

  handleOpenOptions(event) {
    event.preventDefault();
    event.persist();
    const elem = event.currentTarget;
    this.props.dispatch(openOptions(elem));
  }

  handleCloseOptions() {
    this.props.dispatch(closeOptions());
  }

  handleRowSelection(selectedRows) {
    this.props.dispatch(selectionChanged(selectedRows));
  }

  handleAddToPlaylist(playlistId) {
    const { dispatch } = this.props;
    dispatch(closeOptions());
    dispatch(makeSelectable(playlistId));
  }

  addSelectionToPlaylistAction() {
    const { selected, playlistId, songs, dispatch } = this.props;
    const selectedSongs = [];
    for (let i = 0; i < selected.length; i++) {
      selectedSongs.push(songs[selected[i]].id);
    }
    dispatch(addSongsToPlaylist(playlistId, selectedSongs));
    dispatch(makeStatic());
  }

  addSongToPlaylistAction(playlistId) {
    const { dispatch, songId } = this.props;
    const selectedSongs = [];
    console.log('SongID: ', songId);
    selectedSongs.push(songId);
    dispatch(addSongsToPlaylist(playlistId, selectedSongs));
    dispatch(closeContextMenu());
  }

  addSongToQueueAction() {
    const { dispatch, songId } = this.props;
    dispatch(addToEndOfQueue(songId));
    dispatch(closeContextMenu());
  }

  handleCloseContextMenu() {
    this.props.dispatch(closeContextMenu());
  }

  cancelSelectable() {
    this.props.dispatch(makeStatic());
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

  render() {
    const {
      title,
      subtitle,
      image,
      songs,
      loaded,
      playAction,
      onSongDoubleClick,
      playlists,
      optionsOpen,
      optionsAnchor,
      selectable,
      selected,
      contextMenuOpen,
      contextMenuAnchor,
      songId,
    } = this.props;
    return (
      <SongListDumb
        // data
        title={title}
        subtitle={subtitle}
        image={image}
        songs={songs}
        loaded={loaded}
        playlists={playlists}
        selectable={selectable}

        // actions
        playAction={playAction}
        onSongDoubleClick={onSongDoubleClick}
        optionsOpen={optionsOpen}
        optionsAnchor={optionsAnchor}
        addSelectionToPlaylistAction={this.addSelectionToPlaylistAction.bind(this)}
        handleAddToPlaylist={this.handleAddToPlaylist.bind(this)}
        handleRowSelection={this.handleRowSelection.bind(this)}
        openOptions={this.handleOpenOptions.bind(this)}
        closeOptions={this.handleCloseOptions.bind(this)}
        cancelSelectable={this.cancelSelectable.bind(this)}

        contextMenuOpen={contextMenuOpen}
        contextMenuAnchor={contextMenuAnchor}
        songOnMouseUp={this.songOnMouseUp.bind(this)}
        handleCloseContextMenu={this.handleCloseContextMenu.bind(this)}
        addSongToPlaylistAction={this.addSongToPlaylistAction.bind(this)}
        addSongToQueueAction={this.addSongToQueueAction.bind(this)}
      />
    );
  }
}

SongList.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  songs: PropTypes.arrayOf(PropTypes.object),
  loaded: PropTypes.bool.isRequired,
  playAction: PropTypes.func,
  onSongDoubleClick: PropTypes.func,
};

export default connect((store) => {
  const { playlists, songList } = store;
  return ({
    playlists: playlists.playlists,
    playlistsLoaded: playlists.playlistsLoaded,
    optionsOpen: songList.optionsOpen,
    optionsAnchor: songList.optionsAnchor,
    selectable: songList.selectable,
    selected: songList.selected,
    playlistId: songList.playlistId,
    contextMenuOpen: songList.contextMenuOpen,
    contextMenuAnchor: songList.contextMenuAnchor,
    songId: songList.songId,

  });
})(SongList);
