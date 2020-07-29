import React, { Component } from 'react';
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import Popover from 'material-ui/Popover';
import Slider from 'material-ui/Slider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import Play from 'material-ui/svg-icons/av/play-arrow';
import Pause from 'material-ui/svg-icons/av/pause';
import Repeat from 'material-ui/svg-icons/av/repeat';
import Volume from 'material-ui/svg-icons/av/volume-up';
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
import defaultImage from '../../images/logo_negative_no_bg.png';
import MillisToTime from './../MillisToTime';

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
  nextTooltip: {
    id: 'Player.nextTooltip',
    defaultMessage: 'Next',
  },
  shuffleTooltip: {
    id: 'Player.shuffleTooltip',
    defaultMessage: 'Shuffle',
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
  time1: {
    color: fullWhite,
    fontSize: '0.7em',
    margin: 'auto',
    marginLeft: '20px',
  },
  time2: {
    color: fullWhite,
    fontSize: '0.7em',
    margin: 'auto',
    marginRight: '10px',
  },
  volumePopover: {
    height: '100px',
    width: '48px',
    margin: 'auto',
    backgroundColor: '#1a1a1a',
    position: 'relative',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
};


class Player extends Component {
  mapQueue(queue) {
    if (queue) {
      const songs = queue.map((queItm) => (
        <TableRow key={queItm.itemId}>
          <TableRowColumn>
            {queItm.song.title}
          </TableRowColumn>
        </TableRow>
      ));
      return (songs);
    }
    return null;
  }

  render() {
    const { formatMessage } = this.props.intl;
    const {
      orderQueue,
      queueOpen,
      currentSong,
      playerConnected,
      playing,
      currentTime,
      volume,
      height,

      seeking,
      sliderValue,
      volumeOpen,
      volumeValue,
      volumeDragging,
      onPlay,
      onPause,
      onNext,
      toggleQueue,
      toggleVolume,
      onVolumeDragStart,
      onVolumeDragStop,
      onVolumeChange,
      onSliderChange,
    } = this.props;

    const song = currentSong !== null ? currentSong : {};
    const sliderMax = song && song.duration > 0 ? song.duration : 100;
    const elapsed = seeking ? sliderValue : Math.max(Math.min(currentTime, sliderMax), 0);
    const volumeSliderValue = volumeDragging ? volumeValue : Math.max(Math.min(volume, 100), 0);

    return (
      <div style={{ ...styles.base, height }}>
        <div style={styles.imageBox}>
          <img
            src={
              this.props.image ? this.props.image : defaultImage
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
        <div style={styles.time1}>
          <MillisToTime value={elapsed} />
        </div>
        <div style={styles.sliderBox}>
          <Slider
            sliderStyle={styles.slider}
            min={0}
            max={sliderMax}
            defaultValue={0}
            value={elapsed}
            onDragStart={this.props.onSeekStart}
            onDragStop={() => this.props.onSeekEnd(this.state.sliderValue)}
            onChange={onSliderChange}
          />
        </div>
        <div style={styles.time2}>
          <MillisToTime value={sliderMax} />
        </div>
        <div>
          {/*<IconButton><Previous /></IconButton>*/}
          <IconButton
            //onTouchTap={currentSong ? (playing ? onPause : onPlay) : null}
            onTouchTap={playing ? onPause : onPlay}
            tooltip={formatMessage(this.props.playing ? messages.pauseTooltip : messages.playTooltip)}
            tooltipPosition={'top-center'}
            //disabled={!currentSong || !playerConnected}
          >
            {playing ? <Pause /> : <Play />}
          </IconButton>
          <IconButton
            //onTouchTap={currentSong ? onNext : null}
            onTouchTap={onNext}
            tooltip={formatMessage(messages.nextTooltip)}
            tooltipPosition={'top-center'}
            //disabled={!currentSong || !playerConnected}
          >
            <Next />
          </IconButton>
          {/*<IconButton><Repeat /></IconButton>*/}
          {/*
          <IconButton
            onTouchTap={toggleQueue}
            tooltip={formatMessage(messages.shuffleTooltip)}
            tooltipPosition={'top-center'}
          >
            <Shuffle />
          </IconButton>
          */}
          <div style={{display: "inline-block"}} ref={elem => this.volumeAnchor = elem}>
            <IconButton
              onTouchTap={toggleVolume}
              tooltip={volume + ' %'}
              tooltipPosition={'top-center'}              
            >
              <Volume/>
            </IconButton>
          </div>
          {/*** Volume popover ***/}
          <Popover
            open={volumeOpen}
            anchorEl={this.volumeAnchor}
            anchorOrigin={{ vertical: 'top', horizontal: 'left',}}
            targetOrigin={{ vertical: 'bottom', horizontal: 'left',}}
            onRequestClose={toggleVolume}
          >
            <div style={this.volumeAnchor ? {...styles.volumePopover, width: this.volumeAnchor.offsetWidth} : styles.volumePopover}>
              <Slider
                axis={'y'}
                style={{height: '70px'}}
                min={0}
                max={100}
                step={1}
                defaultValue={0}
                value={volumeSliderValue}
                onDragStart={onVolumeDragStart}
                onDragStop={onVolumeDragStop}
                onChange={onVolumeChange}
                sliderStyle={styles.slider}
              />
            </div>
          </Popover>
          {/*
          <IconButton
            onTouchTap={toggleQueue}
            tooltip={formatMessage(messages.queueTooltip)}
            tooltipPosition={'top-center'}
          >
            <Queue />
          </IconButton>
          */}
        </div>
        {/*<Drawer width={400} openSecondary open={queueOpen}>
          <AppBar
            title={formatMessage(messages.queueTitle)}
            iconElementLeft={<IconButton onTouchTap={toggleQueue}><NavigationClose /></IconButton>}
          />
          <Table>
            <TableBody showRowHover displayRowCheckbox={false}>
              { orderQueue ? this.mapQueue(orderQueue) : null }
            </TableBody>
          </Table>
        </Drawer>
        */}
      </div>
    );
  }
}

Player.propTypes = {
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  toggleQueue: PropTypes.func.isRequired,
  playing: PropTypes.bool.isRequired,
  queueOpen: PropTypes.bool.isRequired,
  seeking: PropTypes.bool.isRequired,
  playerConnected: PropTypes.bool.isRequired,
  orderQueue: PropTypes.array.isRequired,
  currentSong: PropTypes.object,
  currentTime: PropTypes.number.isRequired,
  volume: PropTypes.number.isRequired,
};

export default injectIntl(Player);
