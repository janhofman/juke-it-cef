import React, { Component } from 'react';
import { connect } from 'react-redux';
import {AudioContext, AudioBufferSourceNode} from 'web-audio-api'
import fs from 'fs';

import {Player} from './../../components';
import { 
    play,
    pause,
    createdContext,
    updateTime,
    setLength,
    startedPlaying,
    seekTo
} from './../../actions/playerActions';
import {
    nextSong,
    removeTopOfQueue,
    toggleQueue,
} from './../../actions/playbackActions';


class PlayerStrip extends Component{
    constructor(props){
        super(props);
        this.state = {
            seeking: false,
        }
    }

    createContext(){
        var audioContext = new window.AudioContext();
        var audioElem = document.getElementById('audioElem');
        var source = audioContext.createMediaElementSource(audioElem);
        source.connect(audioContext.destination);       // connect the source to the context's destination (the speakers)
        return(audioContext);
    }

    playAudio(){
        this.props.dispatch(play());
    }

    pauseAudio(){
        this.props.dispatch(pause());
    }
    playbackFinished(){
         this.props.dispatch((dispatch) => {
            //remove finished song
            dispatch(removeTopOfQueue());
            // ask for next song
            dispatch(nextSong());
         });
    }

    onLoadedMetadata(){
        this.props.dispatch((dispatch) => {
            var audioElem = document.getElementById('audioElem');
            dispatch(setLength(audioElem.duration));
        })
    }

    onTimeUpdate(){
        this.props.dispatch((dispatch) => {
            var audioElem = document.getElementById('audioElem');
            dispatch(updateTime(audioElem.currentTime));
        })
    }

    onCanPlay(){
        if(this.props.playing){
            var audioElem = document.getElementById('audioElem');
            audioElem.play();
        }
    }

    onPlay(){
        const {dispatch} = this.props;
        dispatch(startedPlaying());
    }

    onSeekStart(){
        this.setState((state) => {return {...state, seeking: true}});
    }

    onSeekEnd(value){
        this.props.dispatch(seekTo(value));
        this.setState((state) => {return {...state, seeking: false}});
    }

    toggleQueue(){
        this.props.dispatch(toggleQueue());
    }

    render(){
        return(
            <Player 
                {...this.props}
                playAudio = {this.playAudio.bind(this)}
                pauseAudio = {this.pauseAudio.bind(this)}
                seeking = {this.state.seeking}
                playbackFinished = {this.playbackFinished.bind(this)}
                onTimeUpdate = {this.onTimeUpdate.bind(this)}
                onLoadedMetadata = {this.onLoadedMetadata.bind(this)}
                onCanPlay = {this.onCanPlay.bind(this)}
                onPlay = {this.onPlay.bind(this)}
                onSeekStart = {this.onSeekStart.bind(this)}
                onSeekEnd = {this.onSeekEnd.bind(this)}
                toggleQueue = {this.toggleQueue.bind(this)}
            />
        );
    }    
}

export default connect((store) => {
    const {player, playback, firebase} = store;
    return({
        playing: player.playing,
        currentSong: player.currentSong,
        audioContext: player.audioContext,
        length: player.length,
        currentTime: player.currentTime,
        queueKey: player.queueKey,
        firebase: firebase,
        spotId: store.userData.user.adminForSpot,
        queue: playback.queue,
        queueOpen: playback.queueOpen,
    });
})(PlayerStrip)