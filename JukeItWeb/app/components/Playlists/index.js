// @flow
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import { Link } from 'react-router-dom';
import ScrollPane from './../../containers/ScrollPane';
import TileGrid from './../../containers/TileGrid';
import GridItem from './../GridItem';
import OrangeDivider from './../OrangeDivider';
import StyledTextField from './../StyledTextField';
import NewPlaylistDialog from './../NewPlaylistDialog';
import messages from './messages';
import { randomCoverArtGenerator } from '../../utils';
import Paper from 'material-ui/Paper';


const styles={
    header: {
        fontSize: '2em',
        margin: '0.5em 0'
    },
    addButton: {
        float: 'right',
        clear: 'both',
    },
    image:{
        display: 'block',
        width: '100%'
    },
    wrapper: {
        position: 'relative'
    },
    shadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(66, 66, 66, 0)',        
        transition: 'background .2s ease-out',
        visibility: 'hidden',
    },
    shadowActive: {
        backgroundColor: 'rgba(66, 66, 66, 0.6)',
        visibility: 'visible',
        zIndex: 99,
    },
}

class Playlists extends Component{    
    render(){        
        const { formatMessage } = this.props.intl;
        const {
            playlists,
            dialog,
            showDialog,
            closeDialog,
            saveNewPlaylist,
        } = this.props;
        const generator = randomCoverArtGenerator();
        return (
            <ScrollPane>
                <div style={styles.wrapper}>
                    <p style={styles.header}>{formatMessage(messages.header)}</p>
                    <OrangeDivider/>
                    <FlatButton
                        label={formatMessage(messages.addButton)}
                        icon={<AddIcon/>}
                        containerElement="label"
                        style={styles.addButton}
                        onTouchTap={showDialog}
                    />
                    <TileGrid>
                        {
                            playlists.map((playlist, index) => (                                
                                <GridItem 
                                    title={playlist.name}
                                    subtitle={playlist.description}
                                    key={index}
                                    onTouchTap={() => this.props.showDetail(playlist.id)}
                                >
                                    <img src={playlist.img ? playlist.img : generator.next()} style={styles.image}/>
                                </GridItem>
                            ))
                        }
                    </TileGrid>
                    <NewPlaylistDialog handleCancel={closeDialog} handleSave={saveNewPlaylist} open={dialog}/>
                    {/*<div style={!dialog ? styles.shadow : {...styles.shadow, ...styles.shadowActive}}/>*/}
                </div>
            </ScrollPane>
        )
    }
}

export default injectIntl(Playlists);