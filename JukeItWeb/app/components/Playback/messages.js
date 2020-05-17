import { defineMessages } from 'react-intl';

export default defineMessages({
    queueHeader: {
        id: 'Playback.queueHeader',
        defaultMessage: 'Queue',
    },
    noPlaylist: {
        id: 'Playback.noPlaylist',
        defaultMessage: 'No playlist selected',
    },
    pickPlaylist: {
        id: 'Playback.pickPlaylist',
        defaultMessage: 'Click here to select one',
    },
    nameColumnHeader: {
        id: 'Playback.nameColumnHeader',
        defaultMessage: 'Name',
    },
    artistColumnHeader: {
        id: 'Playback.artistColumnHeader',
        defaultMessage: 'Artist',
    },
    timeColumnHeader: {
        id: 'Playback.timeColumnHeader',
        defaultMessage: 'Time',
    },
    genreColumnHeader: {
        id: 'Playback.genreColumnHeader',
        defaultMessage: 'Genre',
    },
    albumColumnHeader: {
        id: 'Playback.albumColumnHeader',
        defaultMessage: 'Album',
    },
    addToPlaylistQueueOpt: {
        id: 'Playback.addToPlaylistQueueOpt',
        defaultMessage: 'Add to playlist queue',
    },    
    addToPriorityQueueOpt: {
        id: 'Playback.addToPriorityQueueOpt',
        defaultMessage: 'Add to priority queue',
    },
    activateSpot: {
        id: 'Playback.activateSpot',
        defaultMessage: 'activate spot',
    },
    deactivateSpot: {
        id: 'Playback.deactivateSpot',
        defaultMessage: 'deactivate spot',
    },
    removePlaylist: {
        id: 'Playback.removePlaylist',
        defaultMessage: 'remove playlist',
    },
    startPlaying: {
        id: 'Playback.startPlaying',
        defaultMessage: 'Start playback',
    },
    stopPlaying: {
        id: 'Playback.stopPlaying',
        defaultMessage: 'Stop playback',
    },
    title: {
        id: 'Playback.title',
        defaultMessage: 'Playback management',
    },
    songsWidgetTitle: {
        id: 'Playback.songsWidgetTitle',
        defaultMessage: 'Available songs',
    },
    priorityQueueWidgetTitle: {
        id: 'Playback.priorityQueueWidgetTitle',
        defaultMessage: 'Priority queue',
    },
    orderQueueWidgetTitle: {
        id: 'Playback.orderQueueWidgetTitle',
        defaultMessage: 'Order queue',
    },
    playlistQueueWidgetTitle: {
        id: 'Playback.playlistQueueWidgetTitle',
        defaultMessage: 'Playlist queue',
    },
    songsColumnLabel: {
        id: 'Playback.songsColumnLabel',
        defaultMessage: 'Songs',
    },
    songsColumnLabel: {
        id: 'Playback.songsColumnLabel',
        defaultMessage: 'Songs',
    },
    fsNotConnected: {
        id: 'Playback.fsNotConnected',
        defaultMessage: 'Fileserver is not connected!',
    },
    playerNotConnected: {
        id: 'Playback.playerNotConnected',
        defaultMessage: 'Player is not connected!',
    },    
    fsDialogTitle: {
        id: 'Playback.fsDialogTitle',
        defaultMessage: 'Warning',
    },
    fsDialogBody1: {
        id: 'Playback.fsDialogBody1',
        defaultMessage: 'The application has detected that the fileserver you are currently connected to ({currentFs}) is different from the fileserver you used previously ({previousFs}).',
    },
    fsDialogBody2: {
        id: 'Playback.fsDialogBody2',
        defaultMessage: '- If the fileservers are the same, you can continue in playback (Warning! If they are not the same, it will result in unexpected behavior/crash!).',
    },
    fsDialogBody3: {
        id: 'Playback.fsDialogBody3',
        defaultMessage: '- If the fileservers are different, your playlist will be removed and you will be removed and you will be asked to reupload a playlist.',
    },
    fsDialogBody4: {
        id: 'Playback.fsDialogBody4',
        defaultMessage: '- If you can connect to the previously used fileserver, the playback can be resumed after you do so.',
    },
    fsDialogOptionContinue: {
        id: 'Playback.fsDialogOptionContinue',
        defaultMessage: 'They are the same, continue',
    },
    fsDialogOptionRemove: {
        id: 'Playback.fsDialogOptionRemove',
        defaultMessage: 'They are different, remove playlist',
    },
    fsDialogOptionReconnect: {
        id: 'Playback.fsDialogOptionReconnect',
        defaultMessage: 'Let me connect to previous fileserver',
    },
    fsDialogOptionCancel: {
        id: 'Playback.fsDialogOptionCancel',
        defaultMessage: 'Cancel',
    },
});