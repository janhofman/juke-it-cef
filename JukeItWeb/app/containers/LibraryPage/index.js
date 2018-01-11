// @flow
import React, { Component } from 'react';
//import {remote} from 'electron';
import { connect } from 'react-redux';
import Library from './../../components/Library';
//import fs from 'fs';

import {
    setLoading,
    loadSongs,
    addSongs,
} from './../../actions/libraryActions';

//let dialog = remote.dialog;

class LibraryPage extends Component{

    openFile(title){
        /*dialog.showOpenDialog({
            title: title,
            filters: [
                {name: 'Songs', extensions: ['mp3', 'wav', 'aac']}
            ],
            properties:[
                'openFile',
                'multiSelections'
            ]
        }, (filePaths) => {
            if(filePaths !== undefined){
                this.props.dispatch(addSongs(filePaths));
            }
        });*/
    }

    render(){
        return (
            <Library 
                { ...this.props } 
                openFile={this.openFile.bind(this)}
            />
        );
    }
}

export default connect((store) => {
    return({
        //sqlite: store.sqlite,
        firebase: store.firebase,
        user: store.userData.user,
        libLoading: store.library.loading,
    });
})(LibraryPage)