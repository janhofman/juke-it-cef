import React, { Component } from 'react';
import { connect } from 'react-redux';
import Genres from '../../components/Genres';
import LoadScreen from '../../components/LoadScreen';
import { loadGenres } from './../../actions/libraryActions';
import { changeSong } from '../../actions/playerActions';

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
    this.props.router.push(`/home/detail/genre?genreId=${genreId}`);
  }

  render() {
    const { genres, loaded, dispatch } = this.props;
    const song = {};
    //song.path = 'H:\\\\Music\\\\Linkin Park\\\\Linkin Park-Hybrid Theory(Darkside_RG)\\\\08_-In_The_End.mp3';
    //song.path = 'H:\\\\Music\\\\Avenged Sevenfold\\\\Avenged Sevenfold - 2010 - Nightmare\\\\02 - Welcome To The Family.mp3';
    song.path = 'C:\\\\Users\\\\MichalJurco\\\\Downloads\\\\Mark Petrie - Go Time.aac';
    //song.path = 'C:\\\\Users\\\\MichalJurco\\\\Downloads\\\\Jay-Z \\& Linkin Park - Numb  Encore (2).flac'; // flac doesn't work well
    //song.path = 'C:\\\\Users\\\\MichalJurco\\\\Downloads\\\\09. Welcome To The Jungle (Guns N\' Roses).ogg';
    //dispatch(open(song));
    dispatch(changeSong(song, 'aaa'));
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
