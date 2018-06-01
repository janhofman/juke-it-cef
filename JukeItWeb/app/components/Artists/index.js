import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import messages from './messages';

import TileGrid from '../../containers/TileGrid';
import ScrollPane from '../../containers/ScrollPane';
import GridItem from '../GridItem';
import OrangeDivider from '../OrangeDivider';
import defaultImage from '../../images/logo_negative_no_bg.png';

const styles = {
  header: {
    fontSize: '2em',
    margin: '0.5em 0',
  },
  image: {
    display: 'block',
    width: '100%',
  },
  wrapper: {
    position: 'relative',
  },
};

class Artists extends Component {
  render() {
    const {
      artists,
      showDetail,
      intl
    } = this.props;
    const { formatMessage } = intl;
    return (
      <ScrollPane>
        <div style={styles.wrapper}>
          <p style={styles.header}>{formatMessage(messages.header)}</p>
          <OrangeDivider />
          <TileGrid>
            {
              artists.map((artist, index) => (
                <GridItem
                  title={artist.name}
                  key={index}
                  onTouchTap={() => showDetail(artist.id)}
                >
                  <img src={artist.img ? artist.img : defaultImage} style={styles.image} />
                </GridItem>
              ))
            }
          </TileGrid>
        </div>
      </ScrollPane>
    );
  }
}

export default injectIntl(Artists);
