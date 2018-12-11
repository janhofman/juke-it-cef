import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import SongList from '../SongList';
import messages from './messages';

class Songs extends Component {
  render() {
    const {
      loaded,
      songs,
      onSongDoubleClick,
      playAction,
      intl
    } = this.props;
    const { formatMessage } = intl;
    const selectable = false;
    return (
      <SongList
        loaded={loaded}
        songs={songs}
        title={formatMessage(messages.title)}
        selectable={selectable}
        onSongDoubleClick={onSongDoubleClick}
        playAction={() => playAction(formatMessage(messages.title), null)}
      />
    );
  }
}

export default injectIntl(Songs);
