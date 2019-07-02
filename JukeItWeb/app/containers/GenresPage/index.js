import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
import Genres from '../../components/Genres';
import LoadScreen from '../../components/LoadScreen';
import { loadGenres } from './../../actions/libraryActions';

class GenresPage extends Component {
  constructor(props) {
    super(props);
    const { dispatch } = props;

    this.showDetail = this.showDetail.bind(this);

    dispatch(loadGenres());
  }

  componentWillReceiveProps(nextProps) {
    const { loaded, dispatch } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      dispatch(loadGenres());
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
  });
})(GenresPage);
