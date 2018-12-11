import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Player from '../../components/Player';
import {
    play,
    pause,
    next,
    updateTime,
    seekTo,
} from './../../actions/playerActions';
import {
    toggleQueue,
} from './../../actions/playbackActions';


class PlayerStrip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seeking: false,
    };
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.toggleQueue = this.toggleQueue.bind(this);
    this.onNext = this.onNext.bind(this);
  }

  onNext() {
    const { dispatch } = this.props;
    dispatch(next());
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
        onPlay={this.onPlay}
        onPause={this.onPause}
        onNext={this.onNext}
        toggleQueue={this.toggleQueue}
      />
    );
  }
}

PlayerStrip.propTypes = {
  dispatch: PropTypes.func.isRequired,
  playing: PropTypes.bool.isRequired,
};

export default connect((store) => {
  const { player, playback, firebase } = store;
  return ({
    playing: player.playing,
    currentSong: player.currentSong,
    length: player.length,
    currentTime: player.currentTime,
    queueKey: player.queueKey,
    playerConnected: player.playerConnected,
    firebase,
    spotId: store.userData.user.adminForSpot,
    orderQueue: playback.orderQueue,
    queue: playback.queue,
    queueOpen: playback.queueOpen,
  });
})(PlayerStrip);
