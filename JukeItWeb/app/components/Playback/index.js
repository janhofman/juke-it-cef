// @flow
import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import FlatButton from 'material-ui/FlatButton';
import { deepOrange500 } from 'material-ui/styles/colors';
import Popover from 'material-ui/Popover';
import { Menu, MenuItem } from 'material-ui/Menu';
import ScrollPane from './../../containers/ScrollPane';
import StyledLink from './../StyledLink';
import MillisToTime from './../MillisToTime';
import TableBodyRow from '../TableBodyRow';
/*import {
    Table,
    TableHeader,
    TableHeaderColumn,
    TableBody,
    TableRowColumn,
    TableRow,
} from 'material-ui/Table';*/

import { Table, Column, SortDirection } from 'react-virtualized/dist/es/Table';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import 'react-virtualized/styles.css'; // only needs to be imported once

import messages from './messages';
import defaultImage from '../../images/logo_negative_no_bg.png';

const styles = {
  base: {
    padding: '10px',
  },
  actionButton: {
    float: 'right',
    clear: 'right',
    display: 'block',
  },
  right: {
    float: 'right',
    width: '29%',
  },
  clearer: {
    clear: 'both',
  },
  image: {
    height: '8em',
    float: 'left',
    border: '1px solid white',
  },
  playlistName: {
    fontSize: '2em',
    margin: '0 0 0.5em 0',
  },
  title: {
    marginLeft: '9em',
    marginRight: '120px',
  },
  datagrid: {
    clear: 'both',
  },
  mainContainer: {
    display: 'flex',
    margin: '0 -10px',
    height: '100%',
  },
  mainList: {
    margin: '0 10px',
    flexGrow: 2,
    flexShrink: 2,
    flexBasis: 'auto',    
    border: '1px solid white', // temporary
  },
  mainItem: {
    margin: '0 10px',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    border: '1px solid white', // temporary
  },
  headerStyle: {
    color: deepOrange500,
  },
};

class Playback extends Component {

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
            onSongDoubleClick,
            songOnMouseUp,
            contextMenuOpen,
            contextMenuAnchor,
            handleCloseContextMenu,
            addSongToQueueAction,
            active,
            playerEnabled,
            toggleActive,
            removePlaylist,
            startPlaying,
        } = this.props;
    const { title, subtitle, songs, image } = playlist;

    function rowRenderer (props) {
      return <TableBodyRow {...props} />
    }

    const listOpen = true;
    const orderQueueOpen = true;
    const playlistQueueOpen = true;

    return (
      <div>
        <img
          src={image || defaultImage}
          style={styles.image}
        />
        <FlatButton
          label={formatMessage(active ? messages.deactivateSpot : messages.activateSpot)}
          containerElement="div"
          onTouchTap={toggleActive}
          style={styles.actionButton}
        />
        <FlatButton
          label={formatMessage(messages.removePlaylist)}
          containerElement="div"
          onTouchTap={active ? null : removePlaylist}
          disabled={active}
          style={styles.actionButton}
        />
        <FlatButton
          label={formatMessage(messages.startPlaying)}
          containerElement="div"
          onTouchTap={!active || playerEnabled ? null : startPlaying}
          disabled={!active || playerEnabled}
          style={styles.actionButton}
        />
        <div style={styles.title}>

          <div style={styles.playlistInfo}>
            <div>
              <p style={styles.playlistName}>{title || null}</p>
              {/* <RaisedButton
                                label={formatMessage(messages.playButton)}
                                labelPosition='after'
                                containerElement='label'
                                icon={<PlayButton/>}
                                onTouchTap={playAction}
                                style={{verticalAlign: 'middle'}}
                            />
                            <IconButton
                                style={{verticalAlign: 'middle'}}
                                onTouchTap={openOptions}
                            >
                                <Options/>
                            </IconButton>  */}
            </div>
            <p>{subtitle || null}</p>
          </div>
        </div>
{/*
        <div style={styles.mainContainer}>
          <Table>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>
                  {formatMessage(messages.nameColumnHeader)}
                </TableHeaderColumn>
                <TableHeaderColumn>
                  {formatMessage(messages.artistColumnHeader)}
                </TableHeaderColumn>
                <TableHeaderColumn>
                  {formatMessage(messages.albumColumnHeader)}
                </TableHeaderColumn>
                <TableHeaderColumn>
                  {formatMessage(messages.genreColumnHeader)}
                </TableHeaderColumn>
                <TableHeaderColumn style={{ width: '59px' }}>
                  {formatMessage(messages.timeColumnHeader)}
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
          </Table>
          <ScrollPane>
            <Table selectable={false}>
              <TableBody
                displayRowCheckbox={false}
                showRowHover
              >
                {
                  songs ? songs.map((song) => (
                    <TableRow
                      key={song.id}
                      onDoubleClick={
                              onSongDoubleClick ?
                                  (event) => {
                                    event.stopPropagation();
                                    onSongDoubleClick(song.id);
                                  }
                                  : null
                          }
                      onMouseUp={songOnMouseUp ? (event) => songOnMouseUp(event, song.id) : null}
                    >
                      <TableRowColumn>{song.title}</TableRowColumn>
                      <TableRowColumn>{song.artist}</TableRowColumn>
                      <TableRowColumn>{song.album}</TableRowColumn>
                      <TableRowColumn>{song.genre}</TableRowColumn>
                      <TableRowColumn style={{ width: '50px' }}><MillisToTime value={song.duration} /></TableRowColumn>
                    </TableRow>
                  )) : null
                }
              </TableBody>
            </Table>
          </ScrollPane>          
        </div>
          */}
        <div style={{clear: 'both'}}>
          <ScrollPane unscrollable>
              <div style={styles.mainContainer}>
{/****** SONG LIST ******/}          
              {listOpen &&
              <div style={styles.mainList}>
                <AutoSizer>
                  {({height, width}) => (      
                    <Table
                      height={height}
                      headerHeight={45}
                      headerStyle={styles.headerStyle}
                      noRowsRenderer={this._noRowsRenderer}
                      rowGetter={({index}) => songs[index]}
                      rowRenderer={rowRenderer}
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
              </div>
              }

{/****** PLAYLIST QUEUE ******/}   
              {playlistQueueOpen &&       
              <div style={styles.mainItem}>
              <AutoSizer>
                  {({height, width}) => (   
                    <div style={{width, height: '10px', border: '1px solid white', boxSizing: 'border-box'}}>
                    </div>
                  )}
              </AutoSizer>
              </div>
              }
{/****** ORDER QUEUE ******/}    
              {orderQueueOpen &&      
              <div style={styles.mainItem}>
  c
              </div>
              }
            </div>
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
              primaryText={formatMessage(messages.addToQueueOpt)}
              onTouchTap={addSongToQueueAction}
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
