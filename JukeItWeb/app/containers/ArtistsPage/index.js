import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { loadArtists } from './../../actions/libraryActions';
import Artists from '../../components/Artists';
import LoadScreen from '../../components/LoadScreen';

class ArtistsPage extends Component {
  constructor(props) {
    super(props);
    const { dispatch } = props;
    dispatch(loadArtists());
  }

  componentWillReceiveProps(nextProps) {
    const { loaded, dispatch } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      dispatch(loadArtists());
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
          showDetail={this.showDetail.bind(this)}
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
  });
})(ArtistsPage);
