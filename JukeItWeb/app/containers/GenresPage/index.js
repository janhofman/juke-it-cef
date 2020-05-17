import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
import Genres from '../../components/Genres';
import LoadScreen from '../../components/LoadScreen';
import { 
  cleanGenres,
  getAllGenres,
  genresChange,
  setGenresPromise,
} from './../../actions/libraryActions';
import { notify } from './../../actions/evenLogActions';
import { checkFsConnection } from './../../actions/devicesActions';
import { makeCancelable } from '../../utils';
import messages from './messages';


class GenresPage extends Component {
  constructor(props) {
    super(props);

    this.showDetail = this.showDetail.bind(this);

    this.loadGenres();
  }

  componentWillReceiveProps(nextProps) {
    const { loaded } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      this.loadGenres();
    }
  }

  loadGenres() {    
    const {
      loaded,
      fsAddress,
      dispatch,
      intl: {
        formatMessage,
      }
    } = this.props;

    if (!loaded) {
      dispatch(cleanGenres());
      let promise = getAllGenres(fsAddress);
      promise = makeCancelable(promise);
      promise.promise
        .then((genres) => dispatch(genresChange(true, genres)))
        .catch((err) => {
          dispatch(cleanGenres());
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
      dispatch(setGenresPromise(promise));
    }
  }

  showDetail(genreId) {
    const { dispatch, match } = this.props;
    dispatch(push(`${match.url}/${genreId}`));
  }

  render() {
    const { genres, loaded } = this.props;
    return (
      <LoadScreen loading={!loaded}>
        <Genres
          {...this.props}
          genres={genres}
          showDetail={this.showDetail}
        />
      </LoadScreen>
    );
  }
}

GenresPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loaded: PropTypes.bool.isRequired,
  genres: PropTypes.array.isRequired,
};

export default connect((store) => {
  const { library } = store;
  return ({
    genres: library.genres,
    loaded: library.genresLoaded,
    fsAddress: store.devices.fileServer.baseAddress,
  });
})(injectIntl(GenresPage));
