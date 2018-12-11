import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { removePlaylist, uploadAlbumLib } from '../../actions/playbackActions';
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

    this.navigateBack = this.navigateBack.bind(this);
    this.playAction = this.playAction.bind(this);

    dispatch(loadMetadataForAlbum(albumId));
    dispatch(loadSongsForAlbum(albumId));
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
    const { name, artist, match, dispatch } = this.props;
    const { albumId } = match.params;
    dispatch(removePlaylist());
    dispatch(uploadAlbumLib(albumId, name, artist));
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
        navigateBack={this.navigateBack}
        playAction={this.playAction}
        entityType={EntityEnum.ALBUM}
      />
    );
  }
}

AlbumDetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  name: PropTypes.string,
  artist: PropTypes.string,
  songs: PropTypes.array.isRequired,
  loaded: PropTypes.bool.isRequired,
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
