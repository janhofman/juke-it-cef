import React, { Component } from 'react';
import { injectIntl } from 'react-intl';

import messages from './messages';
import TileGrid from '../../containers/TileGrid';
import ScrollPane from '../../containers/ScrollPane';
import GridItem from '../GridItem';
import OrangeDivider from '../OrangeDivider';
import { randomCoverArtGenerator } from '../../utils';

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

class Genres extends Component {

  render() {
    const { formatMessage } = this.props.intl;
    const {
      genres,
      showDetail,
    } = this.props;
    const generator = randomCoverArtGenerator();
    return (
      <ScrollPane>
        <div style={styles.wrapper}>
          <p style={styles.header}>{formatMessage(messages.header)}</p>
          <OrangeDivider />
          <TileGrid>
            {
              genres.map((genre, index) => (
                <GridItem
                  title={genre.name}
                  key={index}
                  onTouchTap={() => showDetail(genre.id)}
                >
                  <img src={genre.img ? genre.img : generator.next()} style={styles.image} />
                </GridItem>
              ))
            }
          </TileGrid>
        </div>
      </ScrollPane>
    );
  }
}

export default injectIntl(Genres);
