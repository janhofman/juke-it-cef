import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import BackArrow from 'material-ui/svg-icons/navigation/arrow-back';
import PlayButton from 'material-ui/svg-icons/av/play-arrow';
import Options from 'material-ui/svg-icons/navigation/more-horiz';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import CircularProgress from 'material-ui/CircularProgress';
import Popover from 'material-ui/Popover';
import { Menu, MenuItem } from 'material-ui/Menu';
import { grey500, deepOrange500 } from 'material-ui/styles/colors';
import {
  Table,
  TableHeader,
  TableHeaderColumn,
  TableBody,
  TableRowColumn,
  TableRow,
} from 'material-ui/Table';
/* import Table from '../Table';
import TableBodyRow from '../TableBodyRow';
import TableHead from '../TableHead';
import TableHeadCell from '../TableHeadCell';*/
import ScrollPane from '../../containers/ScrollPane';
import AutoSizeDiv from '../AutoSizeDiv';
import LoadScreen from '../LoadScreen';
import MillisToTime from '../MillisToTime';
import messages from './messages';
import defaultImage from '../../images/logo_negative_no_bg.png';

const styles = {
  base: {
    padding: '10px',
    height: '100%',
  },
  image: {
    height: '8em',
    float: 'left',
    border: '1px solid white',
  },
  playlistName: {
    fontSize: '2em',
    margin: '5px 80px 10px 0',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  title: {
    marginLeft: '9em',
    marginRight: '120px',
  },
  datagrid: {
    clear: 'both',
  },
  playlistInfo: {

  },
  playButton: {
    display: 'inline-block',
    width: '50px',
  },
};

class SongListDumb extends Component {
  render() {
    const { formatMessage } = this.props.intl;
    const {
      title,
      subtitle,
      image,
      songs,
      loaded,
      playAction,
      onSongDoubleClick,
      playerConnected,
      optionsOpen,
      optionsAnchor,
      selectable,
      openOptions,
      closeOptions,
      addSelectionToPlaylistAction,
      cancelSelectable,
      handleAddToPlaylist,
      handleRowSelection,
      playlists,
      contextMenuOpen,
      contextMenuAnchor,
      songOnMouseUp,
      handleCloseContextMenu,
      addSongToPlaylistAction,
      addSongToQueueAction,
    } = this.props;

    const playButtonDisabled = !loaded || !playerConnected;

    return (<div>
      <LoadScreen loading={!loaded}>
        <img
          src={image || defaultImage}
          style={styles.image}
        />

        <div style={styles.title}>
          <div style={styles.playlistInfo}>
            <div>
              <p style={styles.playlistName}>{title || null}</p>
              <RaisedButton
                label={formatMessage(messages.playButton)}
                labelPosition="after"
                containerElement="label"
                icon={<PlayButton />}
                onTouchTap={playButtonDisabled ? null : playAction}
                style={{ verticalAlign: 'middle' }}
                disabled={playButtonDisabled}
              />
              <IconButton
                style={{ verticalAlign: 'middle' }}
                onTouchTap={openOptions}
              >
                <Options />
              </IconButton>
            </div>
            <p>{subtitle || null}</p>
          </div>
        </div>
        <div style={styles.datagrid}>
          <div style={{ display: selectable ? 'block' : 'none' }}>
            <FlatButton
              label={'Add'}
              // abelPosition='after'
              containerElement="label"
              // icon={<PlayButton/>}
              onTouchTap={addSelectionToPlaylistAction}
              // style={{verticalAlign: 'middle'}}
            />
            <FlatButton
              label={'Cancel'}
              // abelPosition='after'
              containerElement="label"
              // icon={<PlayButton/>}
              onTouchTap={cancelSelectable}
              // style={{verticalAlign: 'middle'}}
            />
          </div>

          <Table>
            <TableHeader adjustForCheckbox={selectable} displaySelectAll={selectable}>
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
            {/*
                        <AutoSizeDiv>
            <Table
              head={<TableHead>
                <TableHeadCell>
                  {formatMessage(messages.nameColumnHeader)}
                </TableHeadCell>
                <TableHeadCell>
                  {formatMessage(messages.artistColumnHeader)}
                </TableHeadCell>
                <TableHeadCell>
                  {formatMessage(messages.albumColumnHeader)}
                </TableHeadCell>
                <TableHeadCell>
                  {formatMessage(messages.genreColumnHeader)}
                </TableHeadCell>
                <TableHeadCell>
                  {formatMessage(messages.timeColumnHeader)}
                </TableHeadCell>
              </TableHead>}
              items={songs}
              fixedWidth={true}
              getRow={(song, idx) => {
                return (
                  <TableBodyRow key={idx}>
                    <td>{song.title}</td>
                    <td>{song.artist}</td>
                    <td>{song.album}</td>
                    <td>{song.genre}</td>
                    <td><MillisToTime value={song.length}/></td>
                  </TableBodyRow>
                );
              }}
            >
            </Table>
          </AutoSizeDiv>
          */}
            <Table multiSelectable={selectable} selectable={selectable} onRowSelection={handleRowSelection}>
              <TableBody
                displayRowCheckbox={selectable}
                showRowHover
                preScanRows={false}
              >
                {
                    songs ? songs.map((song, idx) => (
                      <TableRow
                        key={idx}
                        onDoubleClick={
                          onSongDoubleClick ?
                            (event) => {
                              event.stopPropagation();
                              onSongDoubleClick(song);
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
          open={optionsOpen}
          anchorEl={optionsAnchor}
          onRequestClose={closeOptions}
        >
          <Menu>
            <MenuItem
              primaryText={formatMessage(messages.addToPlaylistOpt)}
              rightIcon={<ArrowDropRight />}
              menuItems={playlists.map((playlist, idx) =>
                (<MenuItem
                  primaryText={playlist.name} key={idx}
                  onTouchTap={() => handleAddToPlaylist(playlist.id)}
                />))}
            />
          </Menu>
        </Popover>
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
            <MenuItem
              primaryText={formatMessage(messages.addToPlaylistOpt)}
              rightIcon={<ArrowDropRight />}
              menuItems={playlists.map((playlist, idx) =>
                (<MenuItem
                  primaryText={playlist.name} key={idx}
                  onTouchTap={() => addSongToPlaylistAction(playlist.id)}
                />))}
            />
          </Menu>
        </Popover>
      </LoadScreen>
    </div>);
  }
}

SongListDumb.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  songs: PropTypes.arrayOf(PropTypes.object),
  loaded: PropTypes.bool.isRequired,
  playerConnected: PropTypes.bool.isRequired,
  playAction: PropTypes.func,
  onSongDoubleClick: PropTypes.func,
};

export default injectIntl(SongListDumb);
