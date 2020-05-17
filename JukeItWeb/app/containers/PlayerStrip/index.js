import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Player from '../../components/Player';
import {
    play,
    pause,
    next,
    seekTo,
    setVolume,
    updateQueue,
} from './../../actions/playerActions';
import {
    toggleQueue,
} from './../../actions/playbackActions';


class PlayerStrip extends Component {
  constructor(props) {
    super(props);

    this.state = {
      seeking: false,
      sliderValue: 0,
      volumeOpen: false,
      volumeValue: props.volume,
      volumeDragging: false,
    };

    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.toggleQueue = this.toggleQueue.bind(this);
    this.onNext = this.onNext.bind(this);
    this.toggleVolume = this.toggleVolume.bind(this);
    this.onVolumeDragStart = this.onVolumeDragStart.bind(this);
    this.onVolumeDragStop = this.onVolumeDragStop.bind(this);
    this.onVolumeChange = this.onVolumeChange.bind(this);
    this.onSliderChange = this.onSliderChange.bind(this);
  }

  componentDidMount() {
    const {
      dispatch,
      priorityQueue,
      orderQueue,
      playlistQueue
    } = this.props;
    // send queue to player
    const queue = priorityQueue.concat(orderQueue).concat(playlistQueue);
    console.log("Queue update: ", queue);
    dispatch(updateQueue(queue));
  }

  componentWillReceiveProps(nextProps){
    const {
      playlistQueue,
      orderQueue,
      priorityQueue,
      playerConnected,
      dispatch,
      initialized
    } = this.props;

    if(nextProps.playerConnected &&
        nextProps.initialized &&
        (
          !this.arraysEqual(playlistQueue, nextProps.playlistQueue) 
          || !this.arraysEqual(orderQueue, nextProps.orderQueue)
          || !this.arraysEqual(priorityQueue, nextProps.priorityQueue)
          || playerConnected !== nextProps.playerConnected
          || initialized !== nextProps.initialized
        )
    ) {
      // send queue change to player
      const queue = nextProps.priorityQueue.concat(nextProps.orderQueue).concat(nextProps.playlistQueue);
      console.log("Queue update: ", queue);
      dispatch(updateQueue(queue));
    }
  }

  arraysEqual(arr1, arr2) {
    if (arr1.length == arr2.length) {
      for (let i in arr1) {
        if(JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])){
          return false;
        }
      }
      return true;
    }
    return false;
  }

  onNext() {
    const { dispatch } = this.props;
    dispatch(next());
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

  toggleVolume() {
    this.setState((state) => ({ ...state, volumeOpen: !state.volumeOpen }));
  }  
  
  onVolumeDragStart() {
    this.setState((state) => ({ ...state, volumeDragging: true }));
  }

  onVolumeDragStop() {   
    this.props.dispatch(setVolume(this.state.volumeValue));
    this.setState((state) => ({ ...state, volumeDragging: false }));
  }

  onVolumeChange = (event, value) => {
    this.setState((state) => ({ ...state, volumeValue: value }));
  }

  onSliderChange = (event, value) => {
    this.setState((state) => ({ ...state, sliderValue: value }));
  };

  render() {
    return (
      <Player
        {...this.props}
        seeking={this.state.seeking}
        sliderValue={this.state.sliderValue}
        volumeOpen={this.state.volumeOpen}
        volumeValue={this.state.volumeValue}
        volumeDragging={this.state.volumeDragging}
        onPlay={this.onPlay}
        onPause={this.onPause}
        onNext={this.onNext}
        toggleQueue={this.toggleQueue}
        toggleVolume={this.toggleVolume}
        onVolumeDragStart={this.onVolumeDragStart}
        onVolumeDragStop={this.onVolumeDragStop}
        onVolumeChange={this.onVolumeChange}
        onSliderChange={this.onSliderChange}
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
    volume: player.volume,
    initialized: player.initialized,
    firebase,
    spotId: store.userData.user.adminForSpot,
    orderQueue: playback.orderQueue,
    playlistQueue: playback.playlistQueue,
    priorityQueue: playback.priorityQueue,
    queueOpen: playback.queueOpen,
    playbackStarted: playback.playbackStarted,
  });
})(PlayerStrip);
