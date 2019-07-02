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
import { apiEntitySongsPromise } from '../../actions/libraryActions';

class AlbumDetailPage extends Component {
  constructor(props) {
    super(props);
    const {
      dispatch,
      match: {
        params: {
          albumId,
        },
      },
    } = props;

    this.navigateBack = this.navigateBack.bind(this);
    this.playAction = this.playAction.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);

    dispatch(loadMetadataForAlbum(albumId));
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
  
  loadNextPage(baseUrl, startIndex, stopIndex, orderby = null, desc = false, filter = null) {
    const {
      match: {
        params: {
          albumId,
        },
      },
    } = this.props;
    return apiEntitySongsPromise(baseUrl, EntityEnum.ALBUM, albumId, null, stopIndex - startIndex + 1, startIndex, orderby, desc, filter);
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
        loadNextPage={this.loadNextPage}
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
