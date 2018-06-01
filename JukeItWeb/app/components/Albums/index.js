import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import TileGrid from '../../containers/TileGrid';
import ScrollPane from '../../containers/ScrollPane';
import GridItem from '../GridItem';
import OrangeDivider from '../OrangeDivider';
import messages from './messages';
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

class Albums extends Component {
  render() {
    const { formatMessage } = this.props.intl;
    const {
      albums,
      showDetail,
    } = this.props;
    return (
      <ScrollPane>
        <div style={styles.wrapper}>
          <p style={styles.header}>{formatMessage(messages.header)}</p>
          <OrangeDivider />
          <TileGrid>
            {
              albums.map((album, index) => (
                <GridItem
                  title={album.name}
                  subtitle={album.artistName}
                  key={index}
                  onTouchTap={() => showDetail(album.id)}
                >
                  <img src={album.img ? album.img : defaultImage} style={styles.image} />
                </GridItem>
              ))
            }
          </TileGrid>
        </div>
      </ScrollPane>
    );
  }
}

export default injectIntl(Albums);
