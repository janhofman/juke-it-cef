import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import deepOrange500 from 'material-ui/styles/colors';
import { injectIntl } from 'react-intl';
import { Switch, Route, Link } from 'react-router-dom';
import messages from './messages';
import PlayerStrip from '../../containers/PlayerStrip';
import OrangeDivider from './../OrangeDivider';
import LibraryPage from './../../containers/LibraryPage';
import EstablishmentPage from './../../containers/EstablishmentPage';
import PlaylistsPage from './../../containers/PlaylistsPage';
import SettingsPage from './../../containers/SettingsPage';
import PlaybackPage from './../../containers/PlaybackPage';
import DetailPage from '../../containers/DetailPage';

class Home extends Component {
  render() {
    const { match, intl } = this.props;
    const { formatMessage } = intl;
    return (
      <div>
        <div style={{ backgroundColor: '#1a1a1a' }}>
          <Link to="/home/library">
            <FlatButton label={formatMessage(messages.libTabTitle)} />
          </Link>
          <Link to={'/home/playlists'}>
            <FlatButton label={formatMessage(messages.playlistsTabTitle)} />
          </Link>
          <Link to={'/home'}>
            <FlatButton label={formatMessage(messages.establishmentTabTitle)} />
          </Link>
          <Link to={'/home/playback'}>
            <FlatButton label={formatMessage(messages.playbackTabTitle)} />
          </Link>
          <Link to="/home/settings">
            <FlatButton label={formatMessage(messages.settingsTabTitle)} />
          </Link>
          <FlatButton
            label={formatMessage(messages.logout)}
            onTouchTap={this.props.logOut}
          />
        </div>
        <OrangeDivider />
        <div>
          <Switch>
            <Route exact path={match.url} component={EstablishmentPage} />
            <Route path={`${match.url}/detail`} component={DetailPage} />
            <Route path={`${match.url}/library`} component={LibraryPage} />
            <Route path={`${match.url}/playlists`} component={PlaylistsPage} />
            <Route path={`${match.url}/playback`} component={PlaybackPage} />
            <Route path={`${match.url}/settings`} component={SettingsPage} />
          </Switch>
        </div>
        <PlayerStrip height={ '50px' }/>
      </div>
    );
  }
}

export default injectIntl(Home);
