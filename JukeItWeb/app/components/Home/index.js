import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { injectIntl } from 'react-intl';
import { Switch, Route, Link } from 'react-router-dom';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import messages from './messages';
import PlayerStrip from '../../containers/PlayerStrip';
import OrangeDivider from './../OrangeDivider';
import LibraryPage from './../../containers/LibraryPage';
import EstablishmentPage from './../../containers/EstablishmentPage';
import SettingsPage from './../../containers/SettingsPage';
import PlaybackPage from './../../containers/PlaybackPage';
import DevicesPage from '../../containers/DevicesPage';

const styles = {
  disabledLink: {
    pointerEvents: 'none',
  },
};

class Home extends Component {
  render() {
    const { 
      match,
      fsConnected,
      playerConnected,
      intl: {
        formatMessage,
      },
      location: { 
        pathname,
      },
    } = this.props;

    const establishmentPath = match.url;
    const libraryPath = `${match.url}/library`;
    const playbackPath = `${match.url}/playback`;
    const devicesPath = `${match.url}/devices`;
    const settingsPath = `${match.url}/settings`;

    let establishmentMatch = pathname == establishmentPath; // it is an exact match
    let libraryMatch  = pathname.startsWith(libraryPath);
    let playbackMatch  = pathname.startsWith(playbackPath);
    let devicesMatch  = pathname.startsWith(devicesPath);
    let settingsMatch  = pathname.startsWith(settingsPath);

    const libraryEnabled = fsConnected;
    const playbackEnabled = fsConnected && playerConnected;


    console.log('location: ', this.props.location, 'match: ', match);
    return (
      <div>
        <div style={{ backgroundColor: '#1a1a1a' }}>          
          <Link to={libraryPath} style={libraryEnabled ? null : styles.disabledLink}>
            <FlatButton 
              label={formatMessage(messages.libTabTitle)} 
              labelPosition={'before'}
              secondary={libraryMatch} 
              icon={!libraryEnabled && <CancelIcon color={'red'}/>}
              disabled={!libraryEnabled}
            />
          </Link>
          <Link to={establishmentPath}>
            <FlatButton label={formatMessage(messages.establishmentTabTitle)} secondary={establishmentMatch}/>
          </Link>
          <Link to={playbackPath} style={playbackEnabled ? null : styles.disabledLink}>
            <FlatButton 
              label={formatMessage(messages.playbackTabTitle)}
              labelPosition={'before'}
              secondary={playbackMatch}
              icon={!playbackEnabled && <CancelIcon color={'red'}/>}
              disabled={!playbackEnabled}
            />
          </Link>
          <Link to={devicesPath}>
            <FlatButton label={formatMessage(messages.devicesTabTitle)} secondary={devicesMatch}/>
          </Link>
          <Link to={settingsPath}>
            <FlatButton label={formatMessage(messages.settingsTabTitle)} secondary={settingsMatch}/>
          </Link>
          <FlatButton
            label={formatMessage(messages.logout)}
            onTouchTap={this.props.logOut}
          />
        </div>
        <OrangeDivider />
        <div>
          <Switch>
            <Route exact path={establishmentPath} component={EstablishmentPage} />
            <Route path={libraryPath} component={LibraryPage} />
            <Route path={playbackPath} component={PlaybackPage} />
            <Route path={devicesPath} component={DevicesPage} />
            <Route path={settingsPath} component={SettingsPage} />
          </Switch>
        </div>
        <PlayerStrip height={ '50px' }/>
      </div>
    );
  }
}

export default injectIntl(Home);
