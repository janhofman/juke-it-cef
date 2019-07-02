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
import {
    Table,
    TableHeader,
    TableHeaderColumn,
    TableBody,
    TableRowColumn,
    TableRow,
} from 'material-ui/Table';
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
        <div style={styles.datagrid}>
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
