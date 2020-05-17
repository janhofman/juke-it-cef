import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
import Playlists from './../../components/Playlists';
import LoadScreen from './../../components/LoadScreen';
import {
    loadPlaylists,
    showDialog,
    addNewPlaylist,
} from './../../actions/libraryActions';
import { notify } from './../../actions/evenLogActions';
import messages from './messages';

class PlaylistsPage extends Component {
  constructor(props) {
    super(props);
    const { dispatch } = this.props;
    dispatch(loadPlaylists());
  }

  componentWillReceiveProps(nextProps) {
    const { loaded, dispatch } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      dispatch(loadPlaylists());
    }
  }

  loadPlaylists() {
    const {
      dispatch,
      intl: {
        formatMessage,
      }
    } = this.props;

    dispatch(loadPlaylists())
      .catch((err) => {
        dispatch(notify(formatMessage(messages.onFetchError)));
      })
  }

  showDetail(playlistId) {
    const { dispatch, match } = this.props;
    dispatch(push(`${match.url}/${playlistId}`));
  }

  showDialog() {
    const { dispatch } = this.props;
    dispatch(showDialog(true));
  }

  closeDialog() {
    const { dispatch } = this.props;
    dispatch(showDialog(false));
  }

  saveNewPlaylist(name, description) {
    const { dispatch } = this.props;
    dispatch(addNewPlaylist(name, description));
  }

  render() {
    const { loaded, playlists, dialog } = this.props;
    return (
      <LoadScreen loading={!loaded}>
        <Playlists
          {...this.props}
          playlists={playlists}
          showDetail={this.showDetail.bind(this)}
          dialog={dialog}
          showDialog={this.showDialog.bind(this)}
          closeDialog={this.closeDialog.bind(this)}
          saveNewPlaylist={this.saveNewPlaylist.bind(this)}
        />
      </LoadScreen>
    );
  }
}

PlaylistsPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loaded: PropTypes.bool.isRequired,
};

export default connect((store) => {
  const { playlists } = store;
  return ({
    playlists: playlists.playlists,
    loaded: playlists.playlistsLoaded,
    dialog: playlists.dialog,
  });
})(PlaylistsPage);
