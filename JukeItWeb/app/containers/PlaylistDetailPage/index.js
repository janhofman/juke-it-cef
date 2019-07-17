import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from "react-router-redux";
import PropTypes from 'prop-types';
import { removePlaylist, uploadPlaylistLib } from './../../actions/playbackActions';
import {
  clear,
  loadMetadataForPlaylist,
  loadSongsForPlaylist,
} from './../../actions/songListActions';
import { apiEntitySongsPromise } from './../../actions/libraryActions';
import MusicEntityDetail from '../../components/MusicEntityDetail';
import { EntityEnum } from './../../utils';

class PlaylistDetailPage extends Component {
  constructor(props) {
    super(props);
    const { match, dispatch } = props;
    const { playlistId } = match.params;
    dispatch((dispatch) => {
      dispatch(loadMetadataForPlaylist(playlistId));
    });
    this.loadNextPage = this.loadNextPage.bind(this);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(clear());
  }

  navigateBack() {
    const { dispatch } = this.props
    dispatch(push('/home/library/playlists'));
  }

  playPlaylist() {
    const { name, description, match, dispatch } = this.props;
    const { playlistId } = match.params;
    dispatch(removePlaylist());
    dispatch(uploadPlaylistLib(playlistId, name, description));
  }

  loadNextPage(baseUrl, startIndex, stopIndex, orderby = null, desc = false, filter = null) {
    const {
      userId,
      match: {
        params: {
          playlistId,
        },
      },
    } = this.props;
    return apiEntitySongsPromise(baseUrl, EntityEnum.PLAYLIST, playlistId, userId, stopIndex - startIndex + 1, startIndex, orderby, desc, filter);
  }

  render() {
    const {
      name,
      description,
      songs,
      loaded,
      match: {
        params: {
          playlistId,
        },
      },
    } = this.props;
    return (
      <MusicEntityDetail
        loaded={loaded}
        songs={songs}
        title={name}
        subtitle={description}
        navigateBack={this.navigateBack.bind(this)}
        playAction={this.playPlaylist.bind(this)}
        entityType={EntityEnum.PLAYLIST}
        loadNextPage={this.loadNextPage}
        playlistId={playlistId}
      />
    );
  }
}

PlaylistDetailPage.propTypes = {
  // getSongs: PropTypes.
};

export default connect((store) => {
  const { songList, userData } = store;
  return ({
    name: songList.title,
    description: songList.subtitle,
    songs: songList.songs,
    loaded: songList.songsLoaded && songList.metadataLoaded,
    userId: userData.userId,
  });
})(PlaylistDetailPage);
