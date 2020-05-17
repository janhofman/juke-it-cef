import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Songs from '../../components/Songs';
import { uploadSongsLib, removePlaylist } from './../../actions/playbackActions';
import { apiSongsPromise } from './../../actions/libraryActions';

class SongsPage extends Component {
  constructor(props) {
    super(props);

    this.playPlaylist = this.playPlaylist.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log('WillReceiveProps');
    const { loaded, dispatch } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      console.log('Called update');
      // dispatch(loadSongs()); use different function to refresh library
    }
  }

  playPlaylist(title, subtitle) {
    const { dispatch } = this.props;
    dispatch(removePlaylist());
    dispatch(uploadSongsLib(title, subtitle));
  }

  loadNextPage(baseUrl, startIndex, stopIndex, orderby = null, desc = false, filter = null) {
    return apiSongsPromise(baseUrl, stopIndex - startIndex + 1, startIndex, orderby, desc, filter);
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
        playAction={this.playPlaylist}
        loadNextPage={this.loadNextPage}
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
