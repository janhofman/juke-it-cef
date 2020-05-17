import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import FileAvailabilityTool from './../../components/FileAvailabilityTool';
import { 
    getUnavailableFiles,
    runFileAvailabilityCheck,
    removeFile,
    refreshFileAvailability
} from '../../actions/fileServerActions';
import { logError, notify } from '../../actions/evenLogActions';
import { makeCancelable } from '../../utils';
import messages from './messages';

class FileAvailabilityToolPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
        loading: false,
        rows: [],
        rowsPromise: null,
        availiabilityCheckRunning: false,
        availiabilityCheckPromise: null,
    };

    this.handleNavigateBack = this.handleNavigateBack.bind(this);
    this.refreshRows = this.refreshRows.bind(this);
    this.handleRunAvailabilityCheck = this.handleRunAvailabilityCheck.bind(this);
    this.handleRemoveFile = this.handleRemoveFile.bind(this);
    this.handleRefreshFileAvailability = this.handleRefreshFileAvailability.bind(this);
  }

  componentDidMount() {
      // fetch updated rows
      this.refreshRows();
  }

  componentWillMount() {
      const { rowsPromise, availiabilityCheckPromise } = this.state;
      // cancel possibly long running promises
      if(rowsPromise) {
          rowsPromise.cancel();
      }

      if(availiabilityCheckPromise) {
        availiabilityCheckPromise.cancel();
      }
  }

  /**
   * asynchronously refreshes rows
   */
  refreshRows() {
    const { 
        dispatch,
        intl: {
            formatMessage,
        },
    } = this.props;

    let promise = dispatch(getUnavailableFiles());
    // make it cancellable as it can be potentionally long running
    let cancelable = makeCancelable(promise);
    cancelable.promise.then((rows) => {
        this.setState({ rows, loading: false, rowsPromise: null });
    }).catch((err) => {
        dispatch(logError({
            description: 'FileAvailabilityToolPage.refreshRows: getUnavailableFiles failed.',
            ...err,
        }));
        dispatch(notify(formatMessage(messages.refreshRowsError)));
        this.setState({ loading:false, rowsPromise: null });
    });

    this.setState({rows: [], loading: true, rowsPromise: cancelable});
  }

  handleNavigateBack() {
    this.props.history.goBack();
  }

  /**
   * Handles running diagnostics for unavailable files asynchronously
   */
  handleRunAvailabilityCheck() {
    const { 
        dispatch,
        intl: {
            formatMessage,
        },
    } = this.props;

    let promise = dispatch(runFileAvailabilityCheck());
    // make it cancellable as it may potentially run a long time
    let cancelable = makeCancelable(promise);
    cancelable.promise.then((result) => {
        if(result.success) {
            dispatch(notify(formatMessage(messages.availabilityCheckSuccess)));
        } else {
            dispatch(notify(formatMessage(messages.availabilityCheckFailed)));
        } 
        this.setState({ availiabilityCheckRunning: false, availiabilityCheckPromise: null });
        this.refreshRows();
    }).catch((err) => {
        dispatch(logError({
            description: 'FileAvailabilityToolPage.handleRunAvailabilityCheck: runFileAvailabilityCheck failed.',
            ...err,
        }));
        dispatch(notify(formatMessage(messages.availabilityCheckError)));
        this.setState({ availiabilityCheckRunning: false, availiabilityCheckPromise: null });        
        this.refreshRows();
    });

    this.setState({rows: [], availiabilityCheckRunning: true, availiabilityCheckPromise: cancelable});
  }
  
  handleRemoveFile(songId) {
    const { 
        dispatch,
        intl: {
            formatMessage,
        },
    } = this.props;

    dispatch(removeFile(songId)).then((result) => {
        if(result.success) {
            dispatch(notify(formatMessage(messages.removeFileSuccess)));
            this.setState((prevState) => {
                return {
                    ...prevState,
                    rows: prevState.rows.filter(song => song.id != songId),
                }
            })
        } else {
            dispatch(notify(formatMessage(messages.removeFileFailed)));
        }
    }).catch((err) => {
        dispatch(logError({
            description: 'FileAvailabilityToolPage.handleRemoveFile: removeFile failed.',
            ...err,
        }));
        dispatch(notify(formatMessage(messages.removeFileError)));
    });
  }

  handleRefreshFileAvailability(songId) {
    const { 
        dispatch,
        intl: {
            formatMessage,
        },
    } = this.props;

    dispatch(refreshFileAvailability(songId)).then((result) => {
        if(result.success) {
            if(result.available) {
                this.setState((prevState) => {
                    return {
                        ...prevState,
                        rows: prevState.rows.filter(song => song.id != songId),
                    }
                })
            } else{
                dispatch(notify(formatMessage(messages.fileNotAvailable)));
            }
        } else {
            dispatch(notify(formatMessage(messages.refreshAvailabilityFailed)));
        }
    }).catch((err) => {
        dispatch(logError({
            description: 'FileAvailabilityToolPage.handleRefreshFileAvailability: refreshFileAvailability failed.',
            ...err,
        }));
        dispatch(notify(formatMessage(messages.refreshAvailabilityError)));
    });
  }

  render() {
    const {
        rows, 
        loading,
        availiabilityCheckRunning,
    } = this.state;
    
    return (
      <FileAvailabilityTool
        {...this.props}
        onNavigateBack={this.handleNavigateBack}        
        onRefreshRows={this.refreshRows}
        onRunAvailabilityCheck={this.handleRunAvailabilityCheck}
        onRemoveFile={this.handleRemoveFile}
        onRefreshFileAvailability={this.handleRefreshFileAvailability}
        rows={rows}
        loading={loading}
        availiabilityCheckRunning={availiabilityCheckRunning}
      />
    );
  }
}

export default connect((store) => ({
  
}))(injectIntl(FileAvailabilityToolPage));
