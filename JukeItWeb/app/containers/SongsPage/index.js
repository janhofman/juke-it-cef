import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Songs from '../../components/Songs';
import { addToEndOfQueue, uploadSongsLib, removePlaylist } from './../../actions/playbackActions';
import { loadSongs } from './../../actions/libraryActions';

class SongsPage extends Component {
  constructor(props) {
    super(props);

    this.onSongDoubleClick = this.onSongDoubleClick.bind(this);
    this.playPlaylist = this.playPlaylist.bind(this);

    const { dispatch } = props;
    dispatch(loadSongs());
  }

  componentWillReceiveProps(nextProps) {
    console.log('WillReceiveProps');
    const { loaded, dispatch } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      console.log('Called update');
      dispatch(loadSongs());
    }
  }

  onSongDoubleClick(song) {
    const { dispatch } = this.props;
    dispatch(addToEndOfQueue(song.id));
  }

  playPlaylist(title, subtitle) {
    const { dispatch } = this.props;
    dispatch(removePlaylist());
    dispatch(uploadSongsLib(title, subtitle));
  }

  render() {
    const {
      songs,
      loaded,
    } = this.props;
    return (
      <Songs
        loaded={loaded}
        songs={songs}
        onSongDoubleClick={this.onSongDoubleClick}
        playAction={this.playPlaylist}
      />
    );
  }
}

SongsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loaded: PropTypes.bool.isRequired,
  songs: PropTypes.array.isRequired,
};

export default connect((store) => {
  const { library } = store;
  return ({
    songs: library.songs,
    loaded: library.songsLoaded,
  });
})(SongsPage);
