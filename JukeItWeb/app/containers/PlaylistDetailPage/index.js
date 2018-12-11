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
import MusicEntityDetail from '../../components/MusicEntityDetail';
import { EntityEnum } from './../../utils';

class PlaylistDetailPage extends Component {
  constructor(props) {
    super(props);
    const { match, dispatch } = props;
    const { playlistId } = match.params;
    dispatch((dispatch) => {
      dispatch(loadMetadataForPlaylist(playlistId));
      dispatch(loadSongsForPlaylist(playlistId));
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(clear());
  }

  navigateBack() {
    const { dispatch } = this.props
    dispatch(push('/home/playlists'));
  }

  playPlaylist() {
    const { name, description, match, dispatch } = this.props;
    const { playlistId } = match.params;
    dispatch(removePlaylist());
    dispatch(uploadPlaylistLib(playlistId, name, description));
  }

  render() {
    const {
      name,
      description,
      songs,
      loaded,
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
      />
    );
  }
}

PlaylistDetailPage.propTypes = {
  // getSongs: PropTypes.
};

export default connect((store) => {
  const { songList } = store;
  return ({
    name: songList.title,
    description: songList.subtitle,
    songs: songList.songs,
    loaded: songList.songsLoaded && songList.metadataLoaded,
  });
})(PlaylistDetailPage);
