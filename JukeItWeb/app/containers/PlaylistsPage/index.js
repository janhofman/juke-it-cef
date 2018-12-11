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
} from './../../actions/playlistsActions';

class PlaylistsPage extends Component {
  constructor(props) {
    super(props);
    props.dispatch(loadPlaylists());
  }

  componentWillReceiveProps(nextProps) {
    console.log('WillReceiveProps');
    const { loaded, dispatch } = this.props;
    if (nextProps.loaded === false && loaded === true) {
      console.log('Called update');
      dispatch(loadPlaylists());
    }
  }

  showDetail(playlistId) {
    const { dispatch } = this.props;
    dispatch(push(`/home/detail/playlist/${playlistId}`));
  }

  showDialog() {
    const { dispatch } = this.props;
    dispatch(showDialog(true));
  }

  closeDialog() {
    const { dispatch } = this.props;
    dispatch(showDialog(false));
  }

  saveNewPlaylist(name, description, image) {
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
