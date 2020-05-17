import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import SongList from '../SongList';
import messages from './messages';

class Songs extends Component {
  render() {
    const {
      loaded,
      songs,
      playAction,
      loadNextPage,
      intl: {
        formatMessage,
      },
    } = this.props;
    const selectable = false;
    return (
      <SongList
        loaded={loaded}
        songs={songs}
        title={formatMessage(messages.title)}
        selectable={selectable}
        playAction={() => playAction(formatMessage(messages.title), null)}
        loadNextPage={loadNextPage}
      />
    );
  }
}

export default injectIntl(Songs);
