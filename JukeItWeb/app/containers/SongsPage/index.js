import React, { Component } from 'react';
import { connect } from 'react-redux';
import Songs from '../../components/Songs';
import { addToEndOfQueue, changePlaylist } from './../../actions/playbackActions';
import { play } from './../../actions/playerActions';
import { loadSongs } from './../../actions/libraryActions';

class SongsPage extends Component {
  constructor(props) {
    super(props);
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
    this.props.dispatch(addToEndOfQueue(song.id));
  }

  playPlaylist(title, subtitle, songs) {
    this.props.dispatch(changePlaylist(title, subtitle, songs));
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
        onSongDoubleClick={this.onSongDoubleClick.bind(this)}
        playAction={this.playPlaylist.bind(this)}
      />
    );
  }
}

export default connect((store) => {
  const { library } = store;
  return ({
    songs: library.songs,
    loaded: library.songsLoaded,
  });
})(SongsPage);
