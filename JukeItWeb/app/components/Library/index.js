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
import LoadScreen from './../LoadScreen';
import messages from './messages';
import GenresPage from '../../containers/GenresPage';
import ArtistsPage from '../../containers/ArtistsPage';
import AlbumsPage from '../../containers/AlbumsPage';
import SongsPage from '../../containers/SongsPage';

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
    const { match, intl } = this.props;
    const { formatMessage } = intl;
    return (
      <div style={styles.base}>
        <div style={styles.menu}>
          <div style={styles.tabs}>
            <StyledLink to="/home/library/genres" >
              {formatMessage(messages.genresLabel)}
            </StyledLink>
            <StyledLink to="/home/library/artists" >
              {formatMessage(messages.artistsLabel)}
            </StyledLink>
            <StyledLink to="/home/library/albums" >
              {formatMessage(messages.albumsLabel)}
            </StyledLink>
            <StyledLink to="/home/library" >
              {formatMessage(messages.songsLabel)}
            </StyledLink>
          </div>
          <div style={styles.ghost} />
          <div style={styles.search}>
            <StyledTextField hintText={formatMessage(messages.searchHint)} />
          </div>
          <div style={styles.ghost} />
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
        <LoadScreen loading={this.props.libLoading}>
          <Switch>
            <Route exact path={match.url} component={SongsPage} />
            <Route path={`${match.url}/albums`} component={AlbumsPage} />
            <Route path={`${match.url}/artists`} component={ArtistsPage} />
            <Route path={`${match.url}/genres`} component={GenresPage} />
          </Switch>
        </LoadScreen>
      </div>
    );
  }
}

export default injectIntl(Library);
