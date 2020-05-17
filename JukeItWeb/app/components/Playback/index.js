// @flow
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import { deepOrange500 } from 'material-ui/styles/colors';
import Popover from 'material-ui/Popover';
import { Menu, MenuItem } from 'material-ui/Menu';
import Dialog from 'material-ui/Dialog';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import ScrollPane from './../../containers/ScrollPane';
import StyledLink from './../StyledLink';
import MillisToTime from './../MillisToTime';
import TableBodyRow from '../TableBodyRow';
import PlaybackWidget from '../PlaybackWidget';
import { Table, Column, SortDirection } from 'react-virtualized/dist/es/Table';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import 'react-virtualized/styles.css'; // only needs to be imported once

import messages from './messages';
import OrangeDivider from '../OrangeDivider';

const styles = {
  base: {
    padding: '10px',
  },
  headline: {
    display: 'flex',
    margin: '0 10px',
  },
  title: { 
    fontSize: '1.5em',
    margin: '0.3em',
  },
  datagrid: {
    clear: 'both',
  },
  mainContainer: {
    display: 'flex',
    margin: '0',
    height: '100%',
  },
  mainList: {
    margin: '10px',
    flexGrow: 2,
    flexShrink: 2,
    flexBasis: '300',    
    //border: '1px solid white', // temporary
  },
  mainItem: {
    margin: '10px',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '150',
    //border: '1px solid white', // temporary
  },
  collapsedItem: {
    margin: '10px',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '1.4em',
    //border: '1px solid white', // temporary
  },  
  centeredTextContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },  
  headerStyle: {
    color: deepOrange500,
  },  
  iconButton: { 
    verticalAlign: 'middle',
  }
};

class Playback extends Component {
  constructor(props){
    super(props);

    this.removeSongRenderer = this.removeSongRenderer.bind(this);
  }

  removeSongRenderer(args) {
    const {
      rowData,
    } = args;

    const {
      onRemoveSong,
    } = this.props;

    return (
      <IconButton
        style={styles.iconButton}
        onTouchTap={() => onRemoveSong(rowData.itemId)}
      >
        <DeleteIcon />
      </IconButton>
    );
  }  

  noPlaylist() {
    const { formatMessage } = this.props.intl;
    return (
      <ScrollPane>
        <p>{formatMessage(messages.noPlaylist)}</p>
        <StyledLink to="/home/library">
          {formatMessage(messages.pickPlaylist)}
        </StyledLink>
      </ScrollPane>
    );
  }

  showPlaylist() {
    const { formatMessage } = this.props.intl;
    const {
      playlist,
      onSongRightClick,
      contextMenuOpen,
      contextMenuAnchor,
      handleCloseContextMenu,
      addToPlaylistQueueOpt,
      addToPriorityQueueOpt,
      active,
      playerEnabled,
      playerConnected,
      fsConnected,
      toggleActive,
      removePlaylist,
      startPlaying,
      stopPlaying,
      onToggleSongs,
      onTogglePlaylistQueue,
      onTogglePriorityQueue,
      onToggleOrderQueue,   
      onFsDialogOptionContinue,
      onFsDialogOptionRemove,
      onFsDialogOptionReconnect,
      onFsDialogOptionCancel,      
      orderQueueOpen,
      playlistQueueOpen,
      priorityQueueOpen,
      availableSongsOpen,
      fsChangedDialogOpen,
      fsCurrentAddress,
      fsOriginalAddress,
    } = this.props;
    const { title, subtitle, songs, image } = playlist;
    
    let playlistQueue = this.props.playlistQueue;
    let orderQueue = this.props.orderQueue;
    let priorityQueue = this.props.priorityQueue;
    if(playlist && playlist.map) {
      playlistQueue = playlistQueue.map((val) => {
        return {...val, song: playlist.map[val.songId] };
      });
      orderQueue = orderQueue.map((val) => {
        return {...val, song: playlist.map[val.songId] };
      });
      priorityQueue = priorityQueue.map((val) => {
        return {...val, song: playlist.map[val.songId] };
      });
    }

    function rowRenderer (props) {
      return <TableBodyRow {...props} />
    }

    function listRowRenderer(props) {
      return <TableBodyRow {...props} rightClick={onSongRightClick} />
    }

    const fsDialogActions = [      
      <FlatButton
        label={formatMessage(messages.fsDialogOptionContinue)}
        onTouchTap={onFsDialogOptionContinue}
      />,
      <FlatButton
        label={formatMessage(messages.fsDialogOptionRemove)}
        onTouchTap={onFsDialogOptionRemove}
      />,
      <FlatButton
        label={formatMessage(messages.fsDialogOptionReconnect)}
        onTouchTap={onFsDialogOptionReconnect}
      />,
      <FlatButton
        label={formatMessage(messages.fsDialogOptionCancel)}
        onTouchTap={onFsDialogOptionCancel}
      />,
    ]

    return (
      <div>
        <div style={styles.headline}> 
        <p style={styles.title}>{formatMessage(messages.title)}</p>
        <div style={{flexGrow: 1}}/>
        <FlatButton
          label={formatMessage(active ? messages.deactivateSpot : messages.activateSpot)}
          containerElement="div"
          onTouchTap={toggleActive}
          style={styles.actionButton}
        />
        <FlatButton
          label={formatMessage(messages.removePlaylist)}
          containerElement="div"
          onTouchTap={active || playerEnabled ? null : removePlaylist}
          disabled={active || playerEnabled}
          style={styles.actionButton}
        />
        <FlatButton
          label={formatMessage(playerEnabled ? messages.stopPlaying : messages.startPlaying)}
          containerElement="div"
          onTouchTap={ playerConnected && fsConnected ? (playerEnabled ? stopPlaying : startPlaying) : null}
          style={styles.actionButton}
          disabled={!playerConnected || !fsConnected}
        />
      </div>
      {/* Fileserver changed dialog */}
      <Dialog
        title={formatMessage(messages.fsDialogTitle)}
        actions={fsDialogActions}
        modal={true}
        open={fsChangedDialogOpen}
      >
        <p>
          {formatMessage(messages.fsDialogBody1, {currentFs: fsCurrentAddress, previousFs: fsOriginalAddress})}   
          <br/><br/>
          {formatMessage(messages.fsDialogBody2)}   
          <br/><br/>
          {formatMessage(messages.fsDialogBody3)}   
          <br/><br/>
          {formatMessage(messages.fsDialogBody4)}  
        </p>
      </Dialog>  
      <OrangeDivider/>
        <div style={{clear: 'both'}}>
          <ScrollPane unscrollable>
            { (!fsConnected || !playerConnected) 
              ? /*** NOT CONNECTED DEVICE ***/
              (                
                <div style={styles.centeredTextContainer}>
                  {formatMessage(fsConnected ? messages.playerNotConnected : messages.fsNotConnected)}
                </div>
              )
              : /*** MAIN PLAYBACK SCREEN ***/
              (
              <div style={styles.mainContainer}>

  {/****** SONG LIST ******/}    
                <PlaybackWidget 
                  style={availableSongsOpen ? styles.mainList : styles.collapsedItem} 
                  open={availableSongsOpen} 
                  title={formatMessage(messages.songsWidgetTitle)}
                  onToggle={onToggleSongs}
                >
                  <AutoSizer>
                    {({height, width}) => (      
                      <Table
                        height={height}
                        headerHeight={45}
                        headerStyle={styles.headerStyle}
                        noRowsRenderer={this._noRowsRenderer}
                        rowGetter={({index}) => songs[index]}
                        rowRenderer={listRowRenderer}
                        rowCount={songs.length}            
                        rowHeight={45}
                        width={width}
                        //sort={onSort}
                        //sortBy={sort.sortBy}
                        //sortDirection={sortDirection}
                      >                      
                        <Column
                          label={formatMessage(messages.nameColumnHeader)}
                          flexGrow={1}
                          flexShrink={0}
                          dataKey="title"
                          width={100}
                        />
                        <Column
                          label={formatMessage(messages.artistColumnHeader)}
                          flexGrow={1}
                          flexShrink={0}
                          dataKey="artist"
                          width={100}
                        />
                        <Column
                          label={formatMessage(messages.albumColumnHeader)}
                          flexGrow={1}
                          flexShrink={0}
                          dataKey="album"
                          width={100}
                        />
                        <Column
                          label={formatMessage(messages.genreColumnHeader)}
                          flexGrow={1}
                          flexShrink={0}
                          dataKey="genre"
                          width={100}
                        />
                        <Column
                          label={formatMessage(messages.timeColumnHeader)}
                          flexGrow={0}
                          flexShrink={1}
                          dataKey="duration"
                          cellRenderer={({cellData}) => <MillisToTime value={cellData} />}
                          width={50}
                        />
                      </Table>
                    )}
                  </AutoSizer>
                </PlaybackWidget>

  {/****** PRIORITY QUEUE ******/}
                <PlaybackWidget 
                  style={priorityQueueOpen ? styles.mainItem : styles.collapsedItem} 
                  open={priorityQueueOpen} 
                  title={formatMessage(messages.priorityQueueWidgetTitle)}
                  onToggle={onTogglePriorityQueue}
                >
                <AutoSizer>
                    {({height, width}) => (      
                      <Table
                        height={height}
                        headerHeight={45}
                        headerStyle={styles.headerStyle}
                        noRowsRenderer={this._noRowsRenderer}
                        rowGetter={({index}) => priorityQueue[index]}
                        rowRenderer={rowRenderer}
                        rowCount={priorityQueue.length}            
                        rowHeight={45}
                        width={width}
                      >                      
                        <Column
                          label={formatMessage(messages.songsColumnLabel)}
                          flexGrow={1}
                          flexShrink={0}
                          dataKey="title"
                          width={100}
                          cellDataGetter={({rowData}) => rowData.song ? rowData.song.title: rowData.songId}
                        />
                        <Column
                          flexGrow={0}
                          flexShrink={0}
                          dataKey="cancel"
                          width={45}
                          cellRenderer={this.removeSongRenderer}
                        />
                      </Table>
                    )}
                  </AutoSizer>
                </PlaybackWidget>  

  {/****** ORDER QUEUE ******/}
                <PlaybackWidget 
                  style={orderQueueOpen ? styles.mainItem : styles.collapsedItem} 
                  open={orderQueueOpen} 
                  title={formatMessage(messages.orderQueueWidgetTitle)}
                  onToggle={onToggleOrderQueue}
                >
                <AutoSizer>
                    {({height, width}) => (      
                      <Table
                        height={height}
                        headerHeight={45}
                        headerStyle={styles.headerStyle}
                        noRowsRenderer={this._noRowsRenderer}
                        rowGetter={({index}) => orderQueue[index]}
                        rowRenderer={rowRenderer}
                        rowCount={orderQueue.length}            
                        rowHeight={45}
                        width={width}
                      >                      
                        <Column
                          label={formatMessage(messages.songsColumnLabel)}
                          flexGrow={1}
                          flexShrink={0}
                          dataKey="title"
                          width={100}
                          cellDataGetter={({rowData}) => rowData.song ? rowData.song.title: rowData.songId}
                        />
                        <Column
                          flexGrow={0}
                          flexShrink={0}
                          dataKey="cancel"
                          width={45}
                          cellRenderer={this.removeSongRenderer}
                        />
                      </Table>
                    )}
                  </AutoSizer>
                </PlaybackWidget>              

  {/****** PLAYLIST QUEUE ******/}                 
                <PlaybackWidget 
                  style={playlistQueueOpen ? styles.mainItem : styles.collapsedItem} 
                  open={playlistQueueOpen} 
                  title={formatMessage(messages.playlistQueueWidgetTitle)}
                  onToggle={onTogglePlaylistQueue}
                >
                <AutoSizer>
                    {({height, width}) => (      
                      <Table
                        height={height}
                        headerHeight={45}
                        headerStyle={styles.headerStyle}
                        noRowsRenderer={this._noRowsRenderer}
                        rowGetter={({index}) => playlistQueue[index]}
                        rowRenderer={rowRenderer}
                        rowCount={playlistQueue.length}            
                        rowHeight={45}
                        width={width}
                      >                      
                        <Column
                          label={formatMessage(messages.songsColumnLabel)}
                          flexGrow={1}
                          flexShrink={0}
                          dataKey="title"
                          width={100}
                          cellDataGetter={({rowData}) => rowData.song ? rowData.song.title: rowData.songId}
                        />
                        <Column
                          flexGrow={0}
                          flexShrink={0}
                          dataKey="cancel"
                          width={45}
                          cellRenderer={this.removeSongRenderer}
                        />
                      </Table>
                    )}
                  </AutoSizer>
                </PlaybackWidget>
              </div>
            )}
          </ScrollPane>
        </div>

        <Popover
          open={contextMenuOpen}
          anchorEl={contextMenuAnchor}
          onRequestClose={handleCloseContextMenu}
          anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          <Menu>
            <MenuItem
              primaryText={formatMessage(messages.addToPlaylistQueueOpt)}
              onTouchTap={addToPlaylistQueueOpt}
            />
            <MenuItem
            primaryText={formatMessage(messages.addToPriorityQueueOpt)}
            onTouchTap={addToPriorityQueueOpt}
          />
          </Menu>
        </Popover>
      </div>
    );
  }

  render() {
    const { playlist } = this.props;
    return (
      <div style={styles.base}>
        { playlist ? this.showPlaylist() : this.noPlaylist()}
      </div>
    );
  }
}

export default injectIntl(Playback);
