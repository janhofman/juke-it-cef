import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {SortDirection} from 'react-virtualized/dist/es/Table';
import SongListDumb from '../SongListDumb';
import {
  addSongToPlaylist,
  addSongsToPlaylist,
  removeSongsFromPlaylist,
  removeFiles,
} from './../../actions/libraryActions';
import { notify, logError } from '../../actions/evenLogActions';
import { checkFsConnection } from '../../actions/devicesActions';
import { makeCancelable } from './../../utils';
import messages from './messages';

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
      selection: {
        removeFiles: false,
        removeSongs: false,
        addToPlaylist: false,
      },
      search: {
        value: '',
        filter: null,        
      },
      contextMenu: {
        open: false,
        anchor: null,
        songId: null,
      }
    };

    this.reload = this.reload.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);
    this.onRowChecked = this.onRowChecked.bind(this);
    this.finishSelection = this.finishSelection.bind(this);
    this.onAddSelectionToPlaylist = this.onAddSelectionToPlaylist.bind(this);
    this.onAddToPlaylistMenuClick = this.onAddToPlaylistMenuClick.bind(this);
    this.onSort= this.onSort.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onSearchValueChange = this.onSearchValueChange.bind(this);
    this.onAddSongToPlaylist = this.onAddSongToPlaylist.bind(this);
    this.onCloseContextMenu = this.onCloseContextMenu.bind(this);
    this.onSongRightClick = this.onSongRightClick.bind(this);
    this.onRemoveFilesOption = this.onRemoveFilesOption.bind(this);
    this.onRemoveSelectedFiles = this.onRemoveSelectedFiles.bind(this);
    this.onRemoveSongsFromPlaylistOption = this.onRemoveSongsFromPlaylistOption.bind(this);
    this.onRemoveSelectedSongsFromPlaylist = this.onRemoveSelectedSongsFromPlaylist.bind(this);
  }

  reload() {
    this.setState((state) => {
      if(state.loadPromise) {
        state.loadPromise.cancel();
      }

      return {
        rows: [],
        hasNextPage: true,
        loadPromise: null,
        loading: false,
      }
    })
  }

  onAddSongToPlaylist(playlistId) {
    const { 
      contextMenu: {
        songId,
      }
    } = this.state;    
    const { dispatch } = this.props;

   
    dispatch(addSongToPlaylist(playlistId, songId));
    this.onCloseContextMenu();
  }

  onCloseContextMenu() {
    this.setState((state) => ({
      ...state,
      contextMenu: {
        ...state.contextMenu,
        open: false,
        anchor: null,
        songId: null,
      }
    }));
  }

  onSongRightClick({event, index, rowData}) {
    if (event.button === 2) {
      event.preventDefault();
      event.persist();
      const { dispatch } = this.props;
      const target = event.currentTarget;

      this.setState((state) => ({
        ...state,
        contextMenu: {
          ...state.contextMenu,
          open: true,
          anchor: target,
          songId: rowData.id,
        }
      }));
    }
  }

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
      dispatch,
      loadNextPage,
      fsBaseAddress,
      intl: {
        formatMessage,
      }
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
    /*if(stopIndex - startIndex + 1 < 20){
      stopIndex = startIndex + 19;
    }*/

    let promise = loadNextPage(fsBaseAddress, startIndex, stopIndex, sortBy, desc, filter);
    promise = makeCancelable(promise);
    promise.promise
      .then((rows) => {
        this.rowsLoaded(rows);
        if(rows.length < stopIndex - startIndex + 1) {
          this.noMoreRows();
        }
        this.loadingFinished();
      })
      .catch((err) => {
        console.log('Loading next page error: ', err);    // TODO: add catch   
        dispatch(logError(err)) ;
        dispatch(notify(formatMessage(messages.onLoadingError)));
        this.loadingFinished();
        // cancel loading
        this.noMoreRows();
        if(err.request && ! err.response) {
          // we did not get any response from server
          // it is possible that connection is compromised
          dispatch(checkFsConnection()) // check connection
            .catch((err) => {
              dispatch(notify(formatMessage(messages.onFsDisconnected)));              
            });
        }
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
      selection: {
        ...state.selection,
        addToPlaylist: true,
      }
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
    this.finishSelection();
  }

  finishSelection() {    
    this.setState((state) => ({
      ...state,
      selectable: false,
      playlistId: null,
      selection: {
        addToPlaylist: false,
        removeFiles: false,
        removeSongs: false,
      },
      rows: [], // clean cache
      hasNextPage: true, // clean cache
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

  onRemoveFilesOption() {
    this.setState((state) => ({
      ...state,
      selectable: true,
      selection: {
        ...state.selection,
        removeFiles: true,
      }
    }));
  }

  onRemoveSelectedFiles() {
    const { 
      rows,
    } = this.state;    
    const { dispatch } = this.props;

    const selectedSongs = [];
    for (let i = 0; i < rows.length; i++) {
      if(rows[i].selected === true) {
        selectedSongs.push(rows[i].id);
      }
    }
    dispatch(removeFiles(selectedSongs));
    this.finishSelection();
  }

  onRemoveSongsFromPlaylistOption() {
    this.setState((state) => ({
      ...state,
      selectable: true,
      selection: {
        ...state.selection,
        removeSongs: true,
      }
    }));
  }

  onRemoveSelectedSongsFromPlaylist() {
    return new Promise((resolve, reject) => {
      const { 
        rows,
      } = this.state;    
      const { dispatch, playlistId } = this.props;

      if(playlistId){
        const selectedSongs = [];
        for (let i = 0; i < rows.length; i++) {
          if(rows[i].selected === true) {
            selectedSongs.push(rows[i].id);
          }
        }
        dispatch(removeSongsFromPlaylist(playlistId, selectedSongs))
          .then(() => { this.reload(); resolve(); })
          .catch((err) => { reject(err); });
        this.finishSelection();
      } else {
        this.finishSelection();
        resolve();
      }     
    });
  }

  render() {
    const {
      title,
      subtitle,
      image,
      playerConnected,
      playAction,
      playlists,
      manageable,
      playlistId,
    } = this.props;

    const {
      selectable,
      loading,
      hasNextPage,
      rows,    
      selection,  
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

    const contextMenu = {
      ...this.state.contextMenu,
      onClose: this.onCloseContextMenu,
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
        contextMenu={contextMenu}
        manageable={manageable}
        selection={selection}
        playlistId={playlistId}

        // actions
        onReload={this.reload}
        playAction={playAction}
        loadNextPage={this.loadNextPage}
        onRowChecked={this.onRowChecked}
        onAddSongToPlaylist={this.onAddSongToPlaylist}
        onAddSelectionToPlaylist={this.onAddSelectionToPlaylist}
        onAddToPlaylistMenuClick={this.onAddToPlaylistMenuClick}
        onCancelSelection={this.finishSelection}
        onSongRightClick={this.onSongRightClick}
        onRemoveFilesOption={this.onRemoveFilesOption}
        onRemoveSelectedFiles={this.onRemoveSelectedFiles}        
        onRemoveSongsFromPlaylistOption={this.onRemoveSongsFromPlaylistOption}
        onRemoveSelectedSongsFromPlaylist={this.onRemoveSelectedSongsFromPlaylist}
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
  playAction: PropTypes.func
};

export default connect((store) => {
  const { playlists, player, devices } = store;
  return ({
    playlists: playlists.playlists,
    playlistsLoaded: playlists.playlistsLoaded,
    playerConnected: player.playerConnected,
    fsBaseAddress: devices.fileServer.baseAddress,
    manageable: store.playback.activePlaylist === null && store.devices.fileServer.local.connected,
  });
})(injectIntl(SongList));
