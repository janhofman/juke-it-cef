// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Playlists from './../../components/Playlists';
import LoadScreen from './../../components/LoadScreen';
import {
    loadPlaylists,
    showDialog,
    addNewPlaylist,
} from './../../actions/playlistsActions';
import {push} from 'react-router-redux';

class PlaylistsPage extends Component{
    constructor(props){
        super(props);
        props.dispatch(loadPlaylists())
    }
    
    showDetail(playlistId){
        this.props.dispatch(push('/home/detail/playlist?playlistId=' + playlistId));
    }

    showDialog(){
        this.props.dispatch(showDialog(true));
    }

    closeDialog(){
        this.props.dispatch(showDialog(false));
    }

    saveNewPlaylist(name, description, image){
        this.props.dispatch(addNewPlaylist(name, description));
    }

    render(){
        const {loaded, playlists, dialog} = this.props;
        return (
            <LoadScreen loading={!loaded}>
                <Playlists 
                    {...this.props}
                    playlists={playlists}              
                    showDetail={this.showDetail.bind(this)}
                    dialog={dialog}
                    showDialog={this.showDialog.bind(this)}
                    closeDialog={this.closeDialog.bind(this)}
                    saveNewPlaylist={this.saveNewPlaylist.bind(this)}        
                />
            </LoadScreen>
        );
    }
}

export default connect((store) => {
    const {playlists} = store;
    return({       
        playlists: playlists.playlists,
        loaded: playlists.playlistsLoaded,
        dialog: playlists.dialog,
    });
})(PlaylistsPage)