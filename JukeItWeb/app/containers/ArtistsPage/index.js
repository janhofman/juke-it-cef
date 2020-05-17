import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { 
  cleanArtists,
  getAllArtists,
  artistsChange,
  setArtistsPromise,
} from './../../actions/libraryActions';
import { notify } from './../../actions/evenLogActions';
import { checkFsConnection } from './../../actions/devicesActions';
import { makeCancelable } from '../../utils';
import Artists from '../../components/Artists';
import LoadScreen from '../../components/LoadScreen';
import messages from './messages';

class ArtistsPage extends Component {
  constructor(props) {
    super(props);

    this.showDetail = this.showDetail.bind(this);

    this.loadArtists()
  }

  componentWillReceiveProps(nextProps) {
    const { loaded } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      this.loadArtists();
    }
  }

  loadArtists() {    
    const {
      loaded,
      fsAddress,
      dispatch,
      intl: {
        formatMessage,
      }
    } = this.props;

    if (!loaded) {
      dispatch(cleanArtists());
      let promise = getAllArtists(fsAddress);
      promise = makeCancelable(promise);
      promise.promise
        .then((artists) => dispatch(artistsChange(true, artists)))
        .catch((err) => {
          dispatch(cleanArtists());
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
      dispatch(setArtistsPromise(promise));
    }
  }

  showDetail(artistId) {
    const { dispatch, match } = this.props;
    dispatch(push(`${match.url}/${artistId}`));
  }

  render() {
    const { artists, loaded } = this.props;
    return (
      <LoadScreen loading={!loaded}>
        <Artists
          {...this.props}
          artists={artists}
          showDetail={this.showDetail}
        />
      </LoadScreen>
    );
  }
}

export default connect((store) => {
  const { library } = store;
  return ({
    artists: library.artists,
    loaded: library.artistsLoaded,
    fsAddress: store.devices.fileServer.baseAddress,
  });
})(injectIntl(ArtistsPage));
