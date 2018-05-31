import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { changePlaylist } from '../../actions/playbackActions';
import {
  clear,
  loadMetadataForArtist,
  loadSongsForArtist,
} from '../../actions/songListActions';
import MusicEntityDetail from '../../components/MusicEntityDetail';
import { EntityEnum } from '../../utils';

class ArtistDetailPage extends Component {
  constructor(props) {
    super(props);
    super(props);
    const { match, dispatch } = props;
    const { artistId } = match.params;
    dispatch((dispatch) => {
      dispatch(loadMetadataForArtist(artistId));
      dispatch(loadSongsForArtist(artistId));
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(clear());
  }

  navigateBack() {
    const { dispatch } = this.props;
    dispatch(push('/home/library/artists'));
  }

  playAction() {
    const { name, songs, dispatch } = this.props;
    dispatch(changePlaylist(name, null, songs));
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
        playAction={this.playAction.bind(this)}
        entityType={EntityEnum.ARTIST}
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
})(ArtistDetailPage);
