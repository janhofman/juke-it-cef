import * as fb from 'firebase';
import {nextSong} from './playbackActions';

export function play(){
    return (dispatch, getState) => {
        const {player} = getState();
        const {currentSong, playing} = player;
        if(!playing && currentSong){
            const audioElem = document.getElementById('audioElem');
            audioElem.play();
        }
        //upload startedPlayingAt on firebase
        dispatch({
            type: 'PLAYER_PLAY',
        });
    }
}

export function stop(){
    return {
        type: 'PLAYER_STOP',
    };
}

export function setLength(length){
    return({
        type: 'PLAYER_SET_LENGTH',
        payload: length,
    })
}

export function createdContext(value){
    return({
        type: 'PLAYER_CREATED_CONTEXT',
        payload: value,
    });
}

export function pause(){
    const audioElem = document.getElementById('audioElem');
    audioElem.pause();
    return({
        type: 'PLAYER_PAUSE',
    });
}

export function updateTime(value){
    return({
        type: 'PLAYER_UPDATE_TIME',
        payload: value,
    })
}

export function changeSong(song, key){
    return({
        type: 'PLAYER_SONG_CHANGE',
        payload: {song: song, key: key},
    });
}

export function stopPlayback(){
    return (dispatch) => {
        const audioElem = document.getElementById('audioElem');
        dispatch(pause());
        dispatch(stop());
    }
}

export function startedPlaying(){
    return (dispatch, getState) => {
        const {firebase, userData, player} = getState();
        const {spotId} = userData;
        //firebase.database().ref('.info/serverTimeOffset').once('value', (offset) => console.log("Offset: ", offset.val(), "Time: ", Date.now(), "Time + offset: ", Date.now() + offset.val()));
        firebase.database()
            .ref('que')
            .child(spotId)
            .child(player.queueKey)
            .update({startedPlayingAt: fb.database.ServerValue.TIMESTAMP});
    }
}

export function seekTo(time){
    return () => {
        const audioElem = document.getElementById('audioElem');
        audioElem.currentTime = time;
    }
}