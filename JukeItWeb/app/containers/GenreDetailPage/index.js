import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { removePlaylist, uploadGenreLib } from '../../actions/playbackActions';
import {
  clear,
  loadMetadataForGenre,
  loadSongsForGenre,
} from '../../actions/songListActions';
import { apiEntitySongsPromise } from '../../actions/libraryActions';
import MusicEntityDetail from '../../components/MusicEntityDetail';
import { EntityEnum } from './../../utils';

class GenreDetailPage extends Component {
  constructor(props) {
    super(props);
    const { match, dispatch } = props;
    const { genreId } = match.params;
    dispatch((dispatch) => {
      dispatch(loadMetadataForGenre(genreId));
    });
    
    this.loadNextPage = this.loadNextPage.bind(this);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(clear());
  }

  navigateBack() {
    const { dispatch } = this.props
      dispatch(push('/home/library/genres'));
  }

  playPlaylist() {
    const { name, match, dispatch } = this.props;
    const { genreId } = match.params;
    dispatch(removePlaylist());
    dispatch(uploadGenreLib(genreId, name, null));
  }

  loadNextPage(baseUrl, startIndex, stopIndex, orderby = null, desc = false, filter = null) {
    const {
      match: {
        params: {
          genreId,
        },
      },
    } = this.props;
    return apiEntitySongsPromise(baseUrl, EntityEnum.GENRE, genreId, null, stopIndex - startIndex + 1, startIndex, orderby, desc, filter);
  }

  render() {
    const {
      name,
      songs,
      loaded,
    } = this.props;
    return (
      <MusicEntityDetail
        loaded={loaded}
        songs={songs}
        title={name}
        navigateBack={this.navigateBack.bind(this)}
        playAction={this.playPlaylist.bind(this)}
        entityType={EntityEnum.GENRE}
        loadNextPage={this.loadNextPage}
      />
    );
  }
}

export default connect((store) => {
  const { songList } = store;
  return ({
    name: songList.title,
    songs: songList.songs,
    loaded: songList.songsLoaded && songList.metadataLoaded,
  });
})(GenreDetailPage);
