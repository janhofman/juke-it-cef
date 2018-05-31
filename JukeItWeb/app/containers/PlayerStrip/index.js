import React, { Component } from 'react';
import { connect } from 'react-redux';

import Player from '../../components/Player';
import {
    play,
    pause,
    open,
    updateTime,
    seekTo,
    registerTimeUpdateCallback,
    registerPlaybackFinishedCallback,
    setOnFinishAction,
} from './../../actions/playerActions';
import {
    nextSong,
    removeTopOfQueue,
    toggleQueue,
} from './../../actions/playbackActions';


class PlayerStrip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seeking: false,
    };
  }

  componentDidMount() {
    const { currentSong, dispatch } = this.props;
    dispatch(setOnFinishAction((dispatch) => {
      // remove finished song
      dispatch(removeTopOfQueue());
      // ask for next song
      dispatch(nextSong());
    }));
    dispatch(registerTimeUpdateCallback());
    dispatch(registerPlaybackFinishedCallback());
    if (currentSong && currentSong.path && currentSong.path.length > 0) {
      dispatch(open(currentSong));
    }
  }

  componentDidUpdate(prevProps) {
    const { currentSong, dispatch, playing } = this.props;
    // song was closed and cancelled
    if (prevProps.currentSong && !currentSong) {
      // dispatch(close)
    } else if (prevProps.currentSong !== currentSong) {
      dispatch(open(currentSong));
      if (playing) {
        dispatch(play());
      }
    }
  }

  onNext() {
    const { dispatch, playing } = this.props;
    dispatch((dispatch) => {
      /*if (playing) {
        dispatch(pause());
      }*/
      // remove finished song
      dispatch(removeTopOfQueue());
      // ask for next song
      dispatch(nextSong());
      /*if (playing) {
        dispatch(play());
      }*/
    });
  }

  onLoadedMetadata() {
  }

  onTimeUpdate() {
    this.props.dispatch((dispatch) => {
      const audioElem = document.getElementById('audioElem');
      dispatch(updateTime(audioElem.currentTime));
    });
  }

  onCanPlay() {
    if (this.props.playing) {
      const audioElem = document.getElementById('audioElem');
      audioElem.play();
    }
  }

  onPlay() {
    const { dispatch } = this.props;
    dispatch(play());
  }

  onPause() {
    const { dispatch } = this.props;
    dispatch(pause());
  }

  onSeekStart() {
    this.setState((state) => ({ ...state, seeking: true }));
  }

  onSeekEnd(value) {
    this.props.dispatch(seekTo(value));
    this.setState((state) => ({ ...state, seeking: false }));
  }

  toggleQueue() {
    this.props.dispatch(toggleQueue());
  }

  render() {
    return (
      <Player
        {...this.props}
        seeking={this.state.seeking}
        onPlay={this.onPlay.bind(this)}
        onPause={this.onPause.bind(this)}
        onNext={this.onNext.bind(this)}
        // onSeekStart={this.onSeekStart.bind(this)}
        // onSeekEnd={this.onSeekEnd.bind(this)}
        toggleQueue={this.toggleQueue.bind(this)}
      />
    );
  }
}

export default connect((store) => {
  const { player, playback, firebase } = store;
  return ({
    playing: player.playing,
    currentSong: player.currentSong,
    audioContext: player.audioContext,
    length: player.length,
    currentTime: player.currentTime,
    queueKey: player.queueKey,
    firebase,
    spotId: store.userData.user.adminForSpot,
    queue: playback.queue,
    queueOpen: playback.queueOpen,
  });
})(PlayerStrip);
