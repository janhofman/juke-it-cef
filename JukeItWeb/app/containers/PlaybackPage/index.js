// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Playback from './../../components/Playback';
import {
    nextSong,
    toggleQueue,
    addToEndOfQueue,
    openContextMenu,
    closeContextMenu,
    removePlaylist,
} from './../../actions/playbackActions';
import {toggleActive} from './../../actions/userDataActions';
import {play} from './../../actions/playerActions';

class PlaybackPage extends Component{
    onSongDoubleClick(songId){
        this.props.dispatch(addToEndOfQueue(songId));
    }

    songOnMouseUp(event, songId){
        if(event.button === 2){
            event.preventDefault();
            event.persist();
            const {dispatch} = this.props;            
            let target = event.currentTarget;
            dispatch(openContextMenu(target, songId));
        }
    }

    toggleQueue(){
        this.props.dispatch(toggleQueue());
    }

    addSongToQueueAction(){
        const {dispatch, songId} = this.props;
        dispatch(addToEndOfQueue(songId));
        dispatch(closeContextMenu());
    }

    handleCloseContextMenu(){
        this.props.dispatch(closeContextMenu());
    }

    toggleActive(){
        this.props.dispatch(toggleActive());
    }

    removePlaylist(){
        this.props.dispatch(removePlaylist());
    }

    startPlaying(){
        const {dispatch} = this.props;
        dispatch((dispatch) => {
            dispatch(nextSong());
            dispatch(play());
        });
    }

    render(){
        return (
            <Playback
                {...this.props}
                onSongDoubleClick={this.onSongDoubleClick.bind(this)}
                toggleQueue={this.toggleQueue.bind(this)}
                songOnMouseUp={this.songOnMouseUp.bind(this)}
                addSongToQueueAction={this.addSongToQueueAction.bind(this)}
                handleCloseContextMenu={this.handleCloseContextMenu.bind(this)}
                toggleActive={this.toggleActive.bind(this)}
                removePlaylist={this.removePlaylist.bind(this)}
                startPlaying={this.startPlaying.bind(this)}
            />
        );
    }
}

export default connect((store) => {
    const {playback, firebase, userData, player} = store;
    return({
        firebase: firebase,
        playlist: playback.activePlaylist,
        queue: playback.queue,
        queueOpen: playback.queueOpen,
        contextMenuAnchor: playback.contextMenuAnchor,
        contextMenuOpen: playback.contextMenuOpen,
        songId: playback.songId,
        active: userData.spot.active,
        playerEnabled: player.currentSong ? true : false,
    });
})(PlaybackPage)