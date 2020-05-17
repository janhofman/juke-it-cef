import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { injectIntl } from 'react-intl';
import { Switch, Route, Link } from 'react-router-dom';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import Snackbar from 'material-ui/Snackbar';
import messages from './messages';
import PlayerStrip from '../../containers/PlayerStrip';
import OrangeDivider from './../OrangeDivider';
import LibraryPage from './../../containers/LibraryPage';
import EstablishmentPage from './../../containers/EstablishmentPage';
import SettingsPage from './../../containers/SettingsPage';
import PlaybackPage from './../../containers/PlaybackPage';
import DevicesPage from '../../containers/DevicesPage';
import FileAvailabilityToolPage from '../../containers/FileAvailabilityToolPage';

const styles = {
  disabledLink: {
    pointerEvents: 'none',
  },
};

class Home extends Component {
  componentDidUpdate(prevProps){
    if(this.props.playerVisible !== prevProps.playerVisible) {
      // hackish, but we want to trigger resize event to recompute
      // any children scrollpane height due to PlayerStrip appearing
      window.dispatchEvent(new Event('resize'));
    }
  }

  render() {
    const { 
      match,
      fsConnected,
      playerConnected,
      playerVisible,
      intl: {
        formatMessage,
      },
      location: { 
        pathname,
      },
      notificationMsg,
      notificationOpen,
      onSnackbarRequestClose,
    } = this.props;

    const establishmentPath = match.url;
    const libraryPath = `${match.url}/library`;
    const playbackPath = `${match.url}/playback`;
    const devicesPath = `${match.url}/devices`;
    const settingsPath = `${match.url}/settings`;
    const fileAvailabilityToolPath = `${match.url}/fileAvailabilityTool`;

    let establishmentMatch = pathname === establishmentPath; // it is an exact match
    let libraryMatch  = pathname.startsWith(libraryPath) || pathname.startsWith(fileAvailabilityToolPath);
    let playbackMatch  = pathname.startsWith(playbackPath);
    let devicesMatch  = pathname.startsWith(devicesPath);
    let settingsMatch  = pathname.startsWith(settingsPath);

    const libraryEnabled = fsConnected;
    const playbackEnabled = fsConnected && playerConnected;
    
    return (
      <div>
        <div style={{ backgroundColor: '#1a1a1a' }}>          
          <Link to={libraryPath}>
            <FlatButton 
              label={formatMessage(messages.libTabTitle)} 
              labelPosition={'before'}
              secondary={libraryMatch}
              icon={!libraryEnabled && <CancelIcon color={'red'}/>}
            />
          </Link>
          <Link to={establishmentPath}>
            <FlatButton label={formatMessage(messages.establishmentTabTitle)} secondary={establishmentMatch}/>
          </Link>
          <Link to={playbackPath}>
            <FlatButton 
              label={formatMessage(messages.playbackTabTitle)}
              labelPosition={'before'}
              secondary={playbackMatch}
              icon={!playbackEnabled && <CancelIcon color={'red'}/>}
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
            <Route path={fileAvailabilityToolPath} component={FileAvailabilityToolPage} />
          </Switch>
        </div>
        { playerVisible &&
          <PlayerStrip height={ '50px' }/>
        }
        <Snackbar
          open={notificationOpen}
          message={notificationMsg}
          autoHideDuration={5000}
          onRequestClose={onSnackbarRequestClose}
        />
      </div>
    );
  }
}

export default injectIntl(Home);
