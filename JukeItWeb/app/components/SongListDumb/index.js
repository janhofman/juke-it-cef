import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import PlayButton from 'material-ui/svg-icons/av/play-arrow';
import Options from 'material-ui/svg-icons/navigation/more-horiz';
import SearchIcon from 'material-ui/svg-icons/action/search';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Popover from 'material-ui/Popover';
import { Menu, MenuItem } from 'material-ui/Menu';
import IconMenu from 'material-ui/IconMenu';
import Checkbox from 'material-ui/Checkbox';
import { deepOrange500 } from 'material-ui/styles/colors';

import InfiniteLoader from 'react-virtualized/dist/es/InfiniteLoader';
import { Table, Column, SortDirection } from 'react-virtualized/dist/es/Table';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import 'react-virtualized/styles.css'; // only needs to be imported once

import TableBodyRow from '../TableBodyRow';
import ScrollPane from '../../containers/ScrollPane';
import MillisToTime from '../MillisToTime';
import StyledTextField from './../StyledTextField';
import messages from './messages';
import defaultImage from '../../images/logo_negative_no_bg.png';

const styles = {
  image: {
    height: '8em',
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
  topContainer: {
    display: 'flex',
    margin: '0 -10px',
  },
  topItem: {
    margin: '0 20px',
  },
  topCenterItem: {
    margin: '0 auto',
    flexGrow: 1,
  },
  playButton: {
    display: 'inline-block',
    width: '50px',
  },
  headerStyle: {
    color: deepOrange500,
  },
  search: {
    width: '200px',
    display: 'inline-block',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: { 
    verticalAlign: 'middle',
  }
};

class SongListDumb extends Component {
  constructor(props) {
    super(props);

    this.selectionCellRenderer = this.selectionCellRenderer.bind(this);
    this.setInfiniteLoaderRef = element => {
      this.infiniteLoader = element;
    };
  }

  selectionCellRenderer(args) {
    const {
      cellData,
      columnData,
      columnIndex,
      dataKey,
      isScrolling,
      rowData,
      rowIndex,
    } = args;

    const {
      onRowChecked,
    } = this.props;

    return (
      <Checkbox 
        checked={cellData}
        onCheck={(_, checked) => onRowChecked(rowIndex, checked)}
      />
    );
  }  

  render() {
    const { formatMessage } = this.props.intl;
    const {
      title,
      subtitle,
      image,
      playAction,
      playerConnected,
      selectable,
      playlists,
      contextMenuOpen,
      contextMenuAnchor,
      handleCloseContextMenu,
      addSongToPlaylistAction,
      addSongToQueueAction,

      sort,
      search,
      loadNextPage,
      hasNextPage,
      isNextPageLoading,
      rows,
      onAddSelectionToPlaylist,
      onAddToPlaylistMenuClick,
      onCancelSelection,
    } = this.props;

    const playButtonDisabled = !playerConnected;

    function rowRenderer (props) {
      return <TableBodyRow {...props} />
    }

    // If there are more items to be loaded then add an extra row to hold a loading indicator.
    const rowCount = hasNextPage
    ? rows.length + 1
    : rows.length

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreRows = loadNextPage;/*isNextPageLoading
      ? () => {}
      : loadNextPage;*/

    const sortDirection = sort.sortBy ? (sort.desc ? SortDirection.DESC : SortDirection.ASC) : null;
    const onSort = (args) => { sort.onSort(args); this.infiniteLoader.resetLoadMoreRowsCache(true); };

    const onSearch = () => { search.onSearch(); this.infiniteLoader.resetLoadMoreRowsCache(true); };
    const onSearchKeyUp = (e) => {
      // Number 13 is the "Enter" key on the keyboard
      if (e.keyCode === 13) {
        e.preventDefault();
        onSearch();
      }
    };
    
    // Every row is loaded except for our loading indicator row.
    const isRowLoaded = ({ index }) => !hasNextPage || index < rows.length

    return (
      <div>
        <div style={styles.topContainer}>
          <div style={styles.topItem}>
            <img
              src={image || defaultImage}
              style={styles.image}
            />
          </div>

          <div style={styles.topCenterItem}>
            <div>
              <p style={styles.playlistName}>{title || null}</p>
              
            <p>{subtitle || null}</p>
            </div>
          </div>

          <div style={styles.topItem}>
            <div>
              <div style={styles.search}>
                <StyledTextField 
                  hintText={formatMessage(messages.searchHint)}
                  floatingLabelText={formatMessage(messages.searchLabel)}
                  onChange={search.onSearchValueChange}
                  value={search.value}
                  onKeyUp={onSearchKeyUp}
                />                
              </div>              
              <IconButton
                style={styles.iconButton}
                onTouchTap={onSearch}
              >
                <SearchIcon/>
              </IconButton>              
            </div>
            { selectable ? (
              <div style={styles.buttons}>
                <FlatButton
                  label={'Add'}
                  // labelPosition='after'
                  containerElement="label"
                  // icon={<PlayButton/>}
                  onTouchTap={onAddSelectionToPlaylist}
                />
                <FlatButton
                  label={'Cancel'}
                  // abelPosition='after'
                  containerElement="label"
                  // icon={<PlayButton/>}
                  onTouchTap={onCancelSelection}
                />
              </div>
            ) : (
              <div style={styles.buttons}>
                <RaisedButton
                  label={formatMessage(messages.playButton)}
                  labelPosition="after"
                  containerElement="label"
                  icon={<PlayButton />}
                  onTouchTap={playButtonDisabled ? null : playAction}
                  style={{ verticalAlign: 'middle' }}
                  disabled={playButtonDisabled}
                />
                <IconMenu
                  iconButtonElement={
                    <IconButton
                      style={styles.iconButton}
                    >
                      <Options />
                    </IconButton>
                  }
                  anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
                  targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                  useLayerForClickAway={true}
                >
                  <MenuItem
                    primaryText={formatMessage(messages.addToPlaylistOpt)}
                    leftIcon={<ArrowDropRight transform='rotate(180)'/>}
                    menuItems={playlists.map((playlist, idx) =>
                      (<MenuItem
                        primaryText={playlist.name} key={idx}
                        onTouchTap={() => onAddToPlaylistMenuClick(playlist.id)}
                    />))}
                  />
                </IconMenu>
              </div>
            )}
          </div>
        </div>
        
        {/*** TABLE  ***/}
        <div>
          <ScrollPane unscrollable >
            <AutoSizer>
              {({height, width}) => (   
                <InfiniteLoader
                  ref={this.setInfiniteLoaderRef}
                  isRowLoaded={isRowLoaded}
                  loadMoreRows={loadMoreRows}
                  rowCount={rowCount}
                  minimumBatchSize={20}
                >
                  {({ onRowsRendered, registerChild }) => (           
                    <Table
                      ref={registerChild}
                      height={height}
                      headerHeight={45}
                      headerStyle={styles.headerStyle}
                      noRowsRenderer={this._noRowsRenderer}
                      onRowsRendered={onRowsRendered}
                      rowGetter={({index}) => (index < rows.length) ? rows[index] : { loading: true }}
                      rowRenderer={rowRenderer}
                      rowCount={rowCount}            
                      rowHeight={45}
                      width={width}
                      sort={onSort}
                      sortBy={sort.sortBy}
                      sortDirection={sortDirection}
                    >
                      {selectable && (
                        <Column
                          cellDataGetter={({rowData}) => rowData.selected ? rowData.selected : false}
                          cellRenderer={this.selectionCellRenderer}
                          dataKey="selected"
                          disableSort                          
                          flexGrow={0}
                          flexShrink={1}
                          width={45}
                      />)}
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
                </InfiniteLoader>
              )}
            </AutoSizer>
          </ScrollPane>
        </div>
        <Popover
          open={contextMenuOpen}
          anchorEl={contextMenuAnchor}
          onRequestClose={handleCloseContextMenu}
          anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
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
      </div>
    );
  }
}

SongListDumb.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  songs: PropTypes.arrayOf(PropTypes.object),
  playerConnected: PropTypes.bool.isRequired,
  playAction: PropTypes.func,
  onSongDoubleClick: PropTypes.func,
};

export default injectIntl(SongListDumb);
