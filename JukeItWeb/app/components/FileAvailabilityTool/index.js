import React, { Component } from 'react';
import PropTypes from 'prop-types';

import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import PlayButton from 'material-ui/svg-icons/av/play-arrow';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import BackArrow from 'material-ui/svg-icons/navigation/arrow-back';
import DiagnosticsIcon from 'material-ui/svg-icons/action/build';
import Popover from 'material-ui/Popover';
import { Menu, MenuItem } from 'material-ui/Menu';
import IconMenu from 'material-ui/IconMenu';
import Checkbox from 'material-ui/Checkbox';
import { deepOrange500 } from 'material-ui/styles/colors';
import CircularProgress from 'material-ui/CircularProgress';

import InfiniteLoader from 'react-virtualized/dist/es/InfiniteLoader';
import { Table, Column, SortDirection } from 'react-virtualized/dist/es/Table';
import AutoSizer from 'react-virtualized/dist/es/AutoSizer';
import 'react-virtualized/styles.css'; // only needs to be imported once

import TableBodyRow from '../TableBodyRow';
import ScrollPane from '../../containers/ScrollPane';
import OrangeDivider from '../OrangeDivider';
import StyledTextField from './../StyledTextField';
import messages from './messages';
import defaultImage from '../../images/logo_negative_no_bg.png';

const styles = {
    base: {
        padding: '10px',
    },
    header: {
        fontSize: '1.5em',
        margin: '0.5em 0',
        display: 'inline-block',
    },
    backButtonWrapper: {
        display: 'inline-block',
        marginRight: '1em',
    },
    tableHeader: {
      color: deepOrange500,
    },
    noRowsContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',        
        alignItems: 'center',
    },
    progress: {
        marginRight: '1em',
    },




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

class FileAvailabilityTool extends Component {
  constructor(props) {
    super(props);

    this.removeCellRenderer = this.removeCellRenderer.bind(this);
    this.refreshCellRenderer = this.refreshCellRenderer.bind(this);
    this.setInfiniteLoaderRef = element => {
      this.infiniteLoader = element;
    };
    this.noRowsRenderer = this.noRowsRenderer.bind(this);
  }

  removeCellRenderer(args) {
    const { cellData } = args;
    const { onRemoveFile } = this.props;

    return (
        <IconButton 
            onTouchTap={() => onRemoveFile(cellData)}
        >
            <DeleteIcon/>
        </IconButton>
    );
  }

  refreshCellRenderer(args) {
    const { cellData } = args;
    const { onRefreshFileAvailability } = this.props;

    return (
        <IconButton 
            onTouchTap={() => onRefreshFileAvailability(cellData)}
        >
            <RefreshIcon/>
        </IconButton>
    );
  }

  noRowsRenderer() {
    const { 
        loading,
        availiabilityCheckRunning,
        intl: {
            formatMessage        
        }
    } = this.props;
    if(loading) {
        return (
            <div style={styles.noRowsContainer}>
                <CircularProgress size={40} thickness={3} color={deepOrange500} style={styles.progress}/>
                <p>
                    {formatMessage(messages.loadingRows)}
                </p>
            </div>
          );
    } else if(availiabilityCheckRunning) {
        return (
            <div style={styles.noRowsContainer}>
                <CircularProgress size={40} thickness={3} color={deepOrange500} style={styles.progress}/>
                <p>
                    {formatMessage(messages.availiabilityCheckRunning)}
                </p>
            </div>
          );
    } else {
        return (
            <div style={styles.noRowsContainer}>

                <p>
                    {formatMessage(messages.noRows)}
                </p>
            </div>
        );
    }
  }

  render() {
    const {
        onNavigateBack,
        onRefreshRows,
        onRunAvailabilityCheck,
        rows,
        loading,
        availiabilityCheckRunning,
      intl: {
          formatMessage
      }
    } = this.props;

    function rowRenderer (props) {
      return <TableBodyRow {...props} />
    }

    //const sortDirection = sort.sortBy ? (sort.desc ? SortDirection.DESC : SortDirection.ASC) : null;
    //const onSort = (args) => { sort.onSort(args); this.infiniteLoader.resetLoadMoreRowsCache(true); };

    return (
        <div style={styles.base}>
            <div style={styles.headerContainer}>
                <div>
                    <div style={styles.backButtonWrapper}>
                        <IconButton
                            tooltip={formatMessage(messages.backTooltip)}
                            onTouchTap={onNavigateBack}
                        >
                            <BackArrow />
                        </IconButton>
                    </div>
                    <p style={styles.header}>{formatMessage(messages.header)}</p>
                </div>
                <div>
                    <FlatButton 
                        label={formatMessage(messages.refreshBtn)}
                        labelPosition={'after'}
                        icon={<RefreshIcon/>}
                        onTouchTap={onRefreshRows}
                    />
                    <FlatButton 
                        label={formatMessage(messages.runDiagnosticsBtn)}
                        labelPosition={'after'}
                        icon={<DiagnosticsIcon/>}
                        onTouchTap={onRunAvailabilityCheck}
                    />
                </div>
          </div>
          <OrangeDivider />    

          {/*** TABLE  ***/}          
          <ScrollPane unscrollable >
            <AutoSizer>
              {({height, width}) => (                       
                <Table
                    height={height}
                    headerHeight={45}
                    headerStyle={styles.tableHeader}
                    noRowsRenderer={this.noRowsRenderer}
                    rowGetter={({index}) => (index < rows.length) ? rows[index] : { loading: true }}
                    rowRenderer={rowRenderer}
                    rowCount={rows.length}            
                    rowHeight={45}
                    width={width}
                    //sort={onSort}
                    //sortBy={sort.sortBy}
                    //sortDirection={sortDirection}
                >                    
                    <Column
                    label={formatMessage(messages.titleColumnHeader)}
                    flexGrow={1}
                    flexShrink={0}
                    dataKey="title"
                    width={100}
                    />
                    <Column
                    label={formatMessage(messages.artistColumnHeader)}
                    flexGrow={1}
                    flexShrink={0}
                    dataKey="artistName"
                    width={100}
                    />
                    <Column
                    label={formatMessage(messages.albumColumnHeader)}
                    flexGrow={1}
                    flexShrink={0}
                    dataKey="albumName"
                    width={100}
                    />
                    <Column
                    label={formatMessage(messages.pathColumnHeader)}
                    flexGrow={2}
                    flexShrink={0}
                    dataKey="path"
                    width={100}
                    />
                    <Column
                        cellDataGetter={({rowData}) => rowData.id}
                        cellRenderer={this.refreshCellRenderer}
                        dataKey="id"
                        disableSort                          
                        flexGrow={0}
                        flexShrink={1}
                        width={45}
                    />
                    <Column
                        cellDataGetter={({rowData}) => rowData.id}
                        cellRenderer={this.removeCellRenderer}
                        dataKey="id"
                        disableSort                          
                        flexGrow={0}
                        flexShrink={1}
                        width={45}
                    />
                </Table>
              )}
            </AutoSizer>
            
          </ScrollPane>      
        </div>
    );
  }
}

FileAvailabilityTool.propTypes = {
  onNavigateBack: PropTypes.func.isRequired,
  onRefreshRows: PropTypes.func.isRequired,
  onRunAvailabilityCheck: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  onRefreshFileAvailability: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  rows: PropTypes.array.isRequired,
  availiabilityCheckRunning: PropTypes.bool.isRequired,
};

export default FileAvailabilityTool;
