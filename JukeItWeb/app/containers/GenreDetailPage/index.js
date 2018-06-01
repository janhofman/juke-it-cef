import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { uploadGenreLib } from '../../actions/playbackActions';
import {
  clear,
  loadMetadataForGenre,
  loadSongsForGenre,
} from '../../actions/songListActions';
import MusicEntityDetail from '../../components/MusicEntityDetail';
import { EntityEnum } from './../../utils';

class GenreDetailPage extends Component {
  constructor(props) {
    super(props);
    const { match, dispatch } = props;
    const { genreId } = match.params;
    dispatch((dispatch) => {
      dispatch(loadMetadataForGenre(genreId));
      dispatch(loadSongsForGenre(genreId));
    });
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
    dispatch(uploadGenreLib(genreId, name, null));
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
