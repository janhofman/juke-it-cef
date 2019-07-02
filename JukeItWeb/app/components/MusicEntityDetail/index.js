import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import BackArrow from 'material-ui/svg-icons/navigation/arrow-back';
import SongList from '../SongList';
import { EntityEnum } from '../../utils';
import messages from './messages';

const styles = {
  base: {
    padding: '10px',
  },
};

class MusicEntityDetail extends Component {
  getEntityDetails(entityType) {
    switch (entityType) {
      case EntityEnum.ALBUM:
        return {
          backTooltip: messages.backTooltipAlbum,
        };
      case EntityEnum.ARTIST:
        return {
          backTooltip: messages.backTooltipArtist,
        };
      case EntityEnum.GENRE:
        return {
          backTooltip: messages.backTooltipGenre,
        };
      case EntityEnum.PLAYLIST:
        return {
          backTooltip: messages.backTooltipPlaylist,
        };
      default:
        return {
          backTooltip: messages.backTooltipDefault,
        };
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const {
      entityType,
      title,
      subtitle,
      image,
      songs,
      loaded,
      playAction,
      navigateBack,
      loadNextPage,
    } = this.props;
    const selectable = false; // to props
    const entityDetails = this.getEntityDetails(entityType);
    return (
      <div style={styles.base}>
        <div>
          <IconButton
            tooltip={formatMessage(entityDetails.backTooltip)}
            onTouchTap={navigateBack}
          >
            <BackArrow />
          </IconButton>
        </div>
        <SongList
          title={title}
          subtitle={subtitle}
          image={image}
          songs={songs}
          loaded={loaded}
          playAction={playAction}
          selectable={selectable}
          loadNextPage={loadNextPage}
        />
      </div>
    );
  }
}

MusicEntityDetail.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  loaded: PropTypes.bool.isRequired,
  songs: PropTypes.arrayOf(PropTypes.object),
  playAction: PropTypes.func,
  navigateBack: PropTypes.func.isRequired,
  entityType: PropTypes.string.isRequired,
  loadNextPage: PropTypes.func.isRequired,
};

export default injectIntl(MusicEntityDetail);
