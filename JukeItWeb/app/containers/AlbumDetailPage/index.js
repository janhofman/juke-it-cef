import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { changePlaylist } from '../../actions/playbackActions';
import {
  clear,
  loadMetadataForAlbum,
  loadSongsForAlbum,
} from '../../actions/songListActions';
import MusicEntityDetail from '../../components/MusicEntityDetail';
import { EntityEnum } from '../../utils';

class AlbumDetailPage extends Component {
  constructor(props) {
    super(props);
    const { match, dispatch } = props;
    const { albumId } = match.params;
    dispatch((dispatch) => {
      dispatch(loadMetadataForAlbum(albumId));
      dispatch(loadSongsForAlbum(albumId));
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(clear());
  }

  navigateBack() {
    const { dispatch } = this.props;
    dispatch(push('/home/library/albums'));
  }

  playAction() {
    const { name, artist, songs, dispatch } = this.props;
    dispatch(changePlaylist(name, artist, songs));
  }

  render() {
    const {
      name,
      artist,
      songs,
      loaded,
    } = this.props;
    return (
      <MusicEntityDetail
        loaded={loaded}
        songs={songs}
        title={name}
        subtitle={artist}
        navigateBack={this.navigateBack.bind(this)}
        playAction={this.playAction.bind(this)}
        entityType={EntityEnum.ALBUM}
      />
    );
  }
}

export default connect((store) => {
  const { songList } = store;
  return ({
    name: songList.title,
    artist: songList.subtitle,
    songs: songList.songs,
    loaded: songList.songsLoaded && songList.metadataLoaded,
  });
})(AlbumDetailPage);
