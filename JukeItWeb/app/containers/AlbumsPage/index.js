import React, { Component } from 'react';
import { connect } from 'react-redux';
import Albums from '../../components/Albums';
import LoadScreen from '../../components/LoadScreen';
import { loadAlbums } from './../../actions/libraryActions';

class AlbumsPage extends Component {
  constructor(props) {
    super(props);
    const { dispatch } = props;
    dispatch(loadAlbums());
  }

  componentWillReceiveProps(nextProps) {
    const { loaded, dispatch } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      dispatch(loadAlbums());
    }
  }

  showDetail(albumId) {
    this.props.router.push(`/home/detail/album?albumId=${albumId}`);
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
  });
})(AlbumsPage);
