import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import Genres from '../../components/Genres';
import LoadScreen from '../../components/LoadScreen';
import { loadGenres } from './../../actions/libraryActions';

class GenresPage extends Component {
  constructor(props) {
    super(props);
    const { dispatch } = props;
    dispatch(loadGenres());
  }

  componentWillReceiveProps(nextProps) {
    const { loaded, dispatch } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      dispatch(loadGenres());
    }
  }

  showDetail(genreId) {
    const { dispatch } = this.props
      dispatch(push(`/home/detail/genre/${genreId}`));
  }

  render() {
    const { genres, loaded } = this.props;
    return (
      <LoadScreen loading={!loaded}>
        <Genres
          {...this.props}
          genres={genres}
          showDetail={this.showDetail.bind(this)}
        />
      </LoadScreen>
    );
  }
}

export default connect((store) => {
  const { library } = store;
  return ({
    genres: library.genres,
    loaded: library.genresLoaded,
  });
})(GenresPage);
