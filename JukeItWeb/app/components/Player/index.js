import React, { Component } from 'react';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import Slider from 'material-ui/Slider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import Play from 'material-ui/svg-icons/av/play-arrow';
import Pause from 'material-ui/svg-icons/av/pause';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Next from 'material-ui/svg-icons/av/skip-next';
import Previous from 'material-ui/svg-icons/av/skip-previous';
import Shuffle from 'material-ui/svg-icons/av/shuffle';
import Queue from 'material-ui/svg-icons/av/queue-music';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import { deepOrange500, fullWhite } from 'material-ui/styles/colors';
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

const messages = defineMessages({
  queueTitle: {
    id: 'Player.queueTitle',
    defaultMessage: 'Queue',
  },
  queueTooltip: {
    id: 'Player.queueTooltip',
    defaultMessage: 'Queue',
  },
  playTooltip: {
    id: 'Player.playTooltip',
    defaultMessage: 'Play',
  },
  pauseTooltip: {
    id: 'Player.pauseTooltip',
    defaultMessage: 'Pause',
  },
});

const styles = {
  base: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
  },
  albumCover: {
    height: '90%',
    display: 'block',
    margin: 'auto',
    border: `1px solid ${fullWhite}`,
  },
  imageBox: {
    height: '80%',
    margin: 'auto 10px',
  },
  slider: {
    margin: 'auto',
  },
  sliderBox: {
    flex: '1 1 auto',
    margin: 'auto 10px',
  },
  title: {
    color: fullWhite,
    fontSize: '1em',
    margin: '0.2em 0',
  },
  author: {
    color: fullWhite,
    fontSize: '0.6em',
    margin: 'auto',
  },
};


class Player extends Component {
  state={
    sliderValue: 0,
  }

  handleSlider = (event, value) => {
    this.setState({ sliderValue: value });
  };

  mapQueue(queue) {
    if (queue) {
      const keys = Object.keys(queue);
      const songs = keys.map((key, idx) => (
        <TableRow key={idx}>
          <TableRowColumn>
            {queue[key].name}
          </TableRowColumn>
        </TableRow>
      ));
      return (songs);
    }
    return null;
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { queue, toggleQueue, queueOpen, currentSong } = this.props;
    const song = currentSong !== null ? currentSong : {};
    const sliderMax = this.props.currentSong && this.props.currentSong.length > 0 ? this.props.currentSong.length : 100;
    return (
      <div style={Object.assign(styles.base, { height: this.props.height })}>
        <div style={styles.imageBox}>
          <img
            src={
              this.props.image ? this.props.image : './../resources/images/logo_negative_no_bg.png'
            }
            style={styles.albumCover}
          />
        </div>
        <div>
          <p style={styles.title}>{song.title ? song.title : null}</p>
          <p style={styles.author}>
            {
              song.artist ? song.artist : (
                <FormattedMessage
                  id={'Player.unknownArtist'}
                  defaultMessage={'Unknown'}
                />
              )
            }
          </p>
        </div>
        <div style={styles.sliderBox}>
          <Slider
            sliderStyle={styles.slider}
            min={0}
            max={sliderMax}
            defaultValue={0}
            value={this.props.seeking ? this.state.sliderValue : Math.min(this.props.currentTime, sliderMax)}
            onDragStart={this.props.onSeekStart}
            onDragStop={() => this.props.onSeekEnd(this.state.sliderValue)}
            onChange={this.handleSlider}
          />
        </div>
        <div>
          <IconButton><Previous /></IconButton>
          <IconButton
            onTouchTap={this.props.playing ? this.props.onPause : this.props.onPlay}
            tooltip={formatMessage(this.props.playing ? messages.pauseTooltip : messages.playTooltip)}
            tooltipPosition={'top-center'}
            disabled={!currentSong}
          >
            {this.props.playing ? <Pause /> : <Play />}
          </IconButton>
          <IconButton><Next /></IconButton>
          <IconButton><Repeat /></IconButton>
          <IconButton><Shuffle /></IconButton>
          <IconButton
            onTouchTap={toggleQueue}
            tooltip={formatMessage(messages.queueTooltip)}
            tooltipPosition={'top-center'}
          >
            <Queue />
          </IconButton>
        </div>
        <Drawer width={400} openSecondary open={queueOpen}>
          <AppBar
            title={formatMessage(messages.queueTitle)}
            iconElementLeft={<IconButton onTouchTap={toggleQueue}><NavigationClose /></IconButton>}
          />
          <Table>
            <TableBody showRowHover displayRowCheckbox={false}>
              { queue ? this.mapQueue(queue) : null }
            </TableBody>
          </Table>
        </Drawer>
      </div>
    );
  }
}

Player.propTypes = {
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  playing: PropTypes.bool.isRequired,
};

export default injectIntl(Player);
