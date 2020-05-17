import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Albums from '../../components/Albums';
import LoadScreen from '../../components/LoadScreen';
import { 
  cleanAlbums,
  getAllAlbums,
  albumsChange,
  setAlbumsPromise,  
} from './../../actions/libraryActions';
import { notify } from './../../actions/evenLogActions';
import { checkFsConnection } from './../../actions/devicesActions';
import { makeCancelable } from '../../utils';
import messages from './messages';

class AlbumsPage extends Component {
  constructor(props) {
    super(props);

    this.showDetail = this.showDetail.bind(this);

    this.loadAlbums();
  }

  componentWillReceiveProps(nextProps) {
    const { loaded } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      this.loadAlbums();
    }
  }

  loadAlbums() {    
    const {
      loaded,
      fsAddress,
      dispatch,
      intl: {
        formatMessage,
      }
    } = this.props;

    if (!loaded) {
      dispatch(cleanAlbums());
      let promise = getAllAlbums(fsAddress);
      promise = makeCancelable(promise);
      promise.promise
        .then((albums) => dispatch(albumsChange(true, albums)))
        .catch((err) => {
          dispatch(cleanAlbums());
          dispatch(notify(formatMessage(messages.onFetchError)));
          if(err.request && ! err.response) {
            // we did not get any response from server
            // it is possible that connection is compromised
            dispatch(checkFsConnection()) // check connection
              .catch((err) => {
                console.log(err);
                dispatch(notify(formatMessage(messages.onFsDisconnected)));              
              });
          }
        }); 
      dispatch(setAlbumsPromise(promise));
    }
  }

  showDetail(albumId) {    
    const { dispatch, match } = this.props;
    dispatch(push(`${match.url}/${albumId}`));
  }

  render() {
    const { albums, loaded } = this.props;
    return (
      <LoadScreen loading={!loaded}>
        <Albums
          {...this.props}
          albums={albums}
          showDetail={this.showDetail.bind(this)}
        />
      </LoadScreen>
    );
  }
}

export default connect((store) => {
  const { library } = store;
  return ({
    albums: library.albums,
    loaded: library.albumsLoaded,
    fsAddress: store.devices.fileServer.baseAddress,
  });
})(injectIntl(AlbumsPage));
