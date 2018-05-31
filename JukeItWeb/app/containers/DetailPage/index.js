import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import AlbumDetailPage from '../AlbumDetailPage';
import ArtistDetailPage from '../ArtistDetailPage';
import GenreDetailPage from '../GenreDetailPage';
import PlaylistDetailPage from '../PlaylistDetailPage';

class DetailPage extends React.Component {
  render() {
    const { match } = this.props;
    return (
      <Switch>
        <Route path={`${match.url}/album/:albumId`} component={AlbumDetailPage} />
        <Route path={`${match.url}/artist/:artistId`} component={ArtistDetailPage} />
        <Route path={`${match.url}/genre/:genreId`} component={GenreDetailPage} />
        <Route path={`${match.url}/playlist/:playlistId`} component={PlaylistDetailPage} />
      </Switch>
    );
  }
}

export default connect((store) => ({
}))(DetailPage);
