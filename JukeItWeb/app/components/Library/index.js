import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import { deepOrange500 } from 'material-ui/styles/colors';
import { injectIntl } from 'react-intl';
import { Switch, Route } from 'react-router-dom';

import ScrollPane from './../../containers/ScrollPane';
import OrangeDivider from './../OrangeDivider';
import StyledLink from './../StyledLink';
import StyledTextField from './../StyledTextField';
import messages from './messages';
import GenresPage from '../../containers/GenresPage';
import ArtistsPage from '../../containers/ArtistsPage';
import AlbumsPage from '../../containers/AlbumsPage';
import SongsPage from '../../containers/SongsPage';
import PlaylistsPage from './../../containers/PlaylistsPage';
import AlbumDetailPage from './../../containers/AlbumDetailPage';
import ArtistDetailPage from './../../containers/ArtistDetailPage';
import GenreDetailPage from './../../containers/GenreDetailPage';
import PlaylistDetailPage from './../../containers/PlaylistDetailPage';

const styles = {
  search: {
    flex: '1 1 auto',
    margin: '0 1em',
    width: '150px',
    maxWidth: '350px',
  },
  base: {
    padding: '10px',
  },
  tabs: {
    display: 'block',
    flex: '0 1 auto',
    margin: 'auto',
  },
  menu: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ghost: {
    flex: '1 1 auto',
  },
  uploadInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0,
  },
  gap: {
    height: '10px',
  },
};

class Library extends Component {

  render() {
    const { 
      match,
      intl: {
        formatMessage,
      },
      location: { 
        pathname,
      },
    } = this.props;

    const songsPath = match.url;
    const genresPath = `${match.url}/genres`;
    const artistsPath = `${match.url}/artists`;
    const playlistPath = `${match.url}/playlists`;
    const albumsPath = `${match.url}/albums`;

    let songsMatch = pathname == songsPath; // it is an exact match
    let genresMatch  = pathname.startsWith(genresPath);
    let artistsMatch  = pathname.startsWith(artistsPath);
    let playlistMatch  = pathname.startsWith(playlistPath);
    let albumsMatch  = pathname.startsWith(albumsPath);

    return (
      <div style={styles.base}>
        <div style={styles.menu}>
          <div style={styles.tabs}>
            <StyledLink to={albumsPath} routeActive={albumsMatch}>
              {formatMessage(messages.albumsLabel)}
            </StyledLink>
            <StyledLink to={artistsPath} routeActive={artistsMatch}>
              {formatMessage(messages.artistsLabel)}
            </StyledLink>
            <StyledLink to={genresPath} routeActive={genresMatch}>
              {formatMessage(messages.genresLabel)}
            </StyledLink>
            <StyledLink to={songsPath} routeActive={songsMatch}>
              {formatMessage(messages.songsLabel)}
            </StyledLink>
            <StyledLink to={playlistPath} routeActive={playlistMatch}>
              {formatMessage(messages.playlistsLabel)}
            </StyledLink>
          </div>
          <div style={styles.ghost} />
          {/*<div style={styles.search}>
            <StyledTextField hintText={formatMessage(messages.searchHint)} />
          </div>
    <div style={styles.ghost} />*/}
          <div style={styles.tabs}>
            <FlatButton
              label={formatMessage(messages.addLabel)}
              icon={<AddIcon />}
              containerElement="label"
              onClick={() => this.props.openFile(formatMessage(messages.openDialogTitle))}
            />
          </div>
        </div>
        <OrangeDivider />
        <div style={styles.gap} />
        <Switch>
          <Route exact path={songsPath} component={SongsPage} />
          <Route exact path={albumsPath} component={AlbumsPage} />
          <Route path={`${albumsPath}/:albumId`} component={AlbumDetailPage} />
          <Route exact path={artistsPath} component={ArtistsPage} />
          <Route path={`${artistsPath}/:artistId`} component={ArtistDetailPage} />
          <Route exact path={genresPath} component={GenresPage} />
          <Route path={`${genresPath}/:genreId`} component={GenreDetailPage} />
          <Route exact path={playlistPath} component={PlaylistsPage} />
          <Route path={`${playlistPath}/:playlistId`} component={PlaylistDetailPage} />
        </Switch>
      </div>
    );
  }
}

export default injectIntl(Library);
