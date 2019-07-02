import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {SortDirection} from 'react-virtualized/dist/es/Table';
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
import { makeCancelable } from './../../utils';

class SongList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rows: [],
      hasNextPage: true,
      loadPromise: null,
      loading: false,
      selectable: false,
      playlistId: null,
      sort: {
        sortBy: null,
        desc: false,
      },
      search: {
        value: '',
        filter: null,        
      },
    };

    this.loadNextPage = this.loadNextPage.bind(this);
    this.onRowChecked = this.onRowChecked.bind(this);
    this.finishAddToPlaylist = this.finishAddToPlaylist.bind(this);
    this.onAddSelectionToPlaylist = this.onAddSelectionToPlaylist.bind(this);
    this.onAddToPlaylistMenuClick = this.onAddToPlaylistMenuClick.bind(this);
    this.onSort= this.onSort.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onSearchValueChange = this.onSearchValueChange.bind(this);
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

  // new methods
  componentWillUnmount() {
    const {
      loadPromise,
    } = this.state;
    if(loadPromise) {
      loadPromise.cancel();
    }
  }

  rowsLoaded(rows) {
    this.setState((state) => ({
      ...state,
      rows: state.rows.concat(rows),
    }));
  }

  noMoreRows() {
    this.setState((state) => ({
      ...state,
      hasNextPage: false,
    }));
  }

  setLoadPromise(promise) {
    this.setState((state) => ({
      ...state,
      loadPromise: promise,
      loading: true,
    }));
  }

  loadingFinished() {
    this.setState((state) => ({
      ...state,
      loadPromise: null,
      loading: false,
    }));
  }

  loadNextPage({startIndex, stopIndex}) {
    console.log(`loadNextPage start: ${startIndex}, stop: ${stopIndex}`);
    const {
      loadNextPage,
      fsBaseAddress,
    } = this.props;

    const {
      sort: {
        sortBy,
        desc
      },
      search: {
        filter,
      }
    } = this.state;

    startIndex += 1; // adjust to start with 1
    stopIndex += 1; // adjust to start with 1

    // always load at least 20 rows
    if(stopIndex - startIndex + 1 < 20){
      stopIndex = startIndex + 19;
    }

    let promise = loadNextPage(fsBaseAddress, startIndex, stopIndex, sortBy, desc, filter);
    promise = makeCancelable(promise);
    promise.promise
      .then((rows) => {
        this.rowsLoaded(rows);
        if(rows.length != stopIndex - startIndex) {
          this.noMoreRows();
        }
        this.loadingFinished();
      })
      .catch((err) => {
        console.log(err);    // TODO: add catch    
        this.loadingFinished();
      });  
    this.setLoadPromise(promise);
    return promise.promise;
  }

  onRowChecked(index, checked) {
    const {
      rows,
    } = this.state;

    if(index < rows.length) {
      rows[index].selected = checked;
      this.setState((state) => ({
        ...state,
        rows,
      }));
    }
  }

  onAddToPlaylistMenuClick(playlistId) {
    this.setState((state) => ({
      ...state,
      selectable: true,
      playlistId,
    }));
  }

  onAddSelectionToPlaylist() {
    const { 
      rows,
      playlistId,
    } = this.state;    
    const { dispatch } = this.props;

    const selectedSongs = [];
    for (let i = 0; i < rows.length; i++) {
      if(rows[i].selected === true) {
        selectedSongs.push(rows[i].id);
      }
    }
    dispatch(addSongsToPlaylist(playlistId, selectedSongs));
    this.finishAddToPlaylist();
  }

  finishAddToPlaylist() {
    const { rows } = this.state;  
    for (let i = 0; i < rows.length; i++) {
      rows[i].selected = false;
    }

    this.setState((state) => ({
      ...state,
      selectable: false,
      playlistId: null,
      rows,
    }));
  }

  onSort({sortBy, sortDirection}) {
    this.setState((state) => ({
      ...state,
      sort: {
        ...state.sort,
        sortBy,
        desc: sortDirection === SortDirection.DESC,
      },
      rows: [], // clean cache
      hasNextPage: true, // clean cache
    }));
  }

  onSearch() {
    const { search: { value } } = this.state;
    this.setState((state) => ({
      ...state,
      search: {
        ...state.search,
        filter: (value && value.length === 0) ? null : value,
      },
      rows: [], // clean cache
      hasNextPage: true, // clean cache
    }));
  }

  onSearchValueChange(event) {
    const value = event.target.value
    this.setState((state) => ({
      ...state,
      search: {
        ...state.search,
        value,
      },
    }));
  }

  render() {
    const {
      title,
      subtitle,
      image,
      playerConnected,
      playAction,
      playlists,
    } = this.props;

    const {
      selectable,
      loading,
      hasNextPage,
      rows,      
    } = this.state;

    const sort = {
      ...this.state.sort,
      onSort: this.onSort,
    };

    const search = {
      ...this.state.search,
      onSearch: this.onSearch,
      onSearchValueChange: this.onSearchValueChange,
    }

    return (
      <SongListDumb
        // data
        title={title}
        subtitle={subtitle}
        image={image}
        playerConnected={playerConnected}
        playlists={playlists}
        sort={sort}  
        search={search}
        selectable={selectable}
        hasNextPage={hasNextPage}
        isNextPageLoading={loading}
        rows={rows}

        // actions
        playAction={playAction}
        songOnMouseUp={this.songOnMouseUp.bind(this)}
        loadNextPage={this.loadNextPage}
        onRowChecked={this.onRowChecked}
        onAddSelectionToPlaylist={this.onAddSelectionToPlaylist}
        onAddToPlaylistMenuClick={this.onAddToPlaylistMenuClick}
        onCancelSelection={this.finishAddToPlaylist}
      />
    );
  }
}

SongList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  songs: PropTypes.arrayOf(PropTypes.object),
  loaded: PropTypes.bool.isRequired,
  playerConnected: PropTypes.bool.isRequired,
  playAction: PropTypes.func,
  onSongDoubleClick: PropTypes.func,
};

export default connect((store) => {
  const { playlists, songList, player, devices } = store;
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
    playerConnected: player.playerConnected,
    fsBaseAddress: devices.fileServer.baseAddress,
  });
})(SongList);
