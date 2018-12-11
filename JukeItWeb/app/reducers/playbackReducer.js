const initialState = {
  activePlaylist: null,
  playbackReady: false,
  playlistQueue: [],
  orderQueue: [],
  queueOpen: false,
  contextMenuOpen: false,
  contextMenuAnchor: null,
  songId: null,
};

export default function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case 'PLAYBACK_PLAYLIST_CHANGED':
      return { ...state, activePlaylist: payload, playbackReady: (payload !== null) };
    case 'PLAYBACK_ADD_PLAYLIST_QUEUE': {
      const { playlistQueue } = state;
      const { songId, itemId } = payload;
      playlistQueue.push({
        songId,
        itemId,
      });
      return { ...state, playlistQueue };
    }
    case 'PLAYBACK_PLAYLISTQUEUE_SONG_DETAIL': {
      const { playlistQueue } = state;
      const { song, itemId } = payload;
      for (let i = playlistQueue.length - 1; i >= 0; i--) {
        if (playlistQueue[i].itemId === itemId) {
          playlistQueue[i].song = song;
          break;
        }
      }
      return { ...state, playlistQueue };
    }
    case 'PLAYBACK_REMOVE_PLAYLIST_QUEUE': {
      const { playlistQueue } = state;
      const { itemId } = payload;
      for (let i = 0; i < playlistQueue.length; i++) {
        if (playlistQueue[i].itemId === itemId) {
          playlistQueue.splice(i, 1);
          break;
        }
      }
      return { ...state, playlistQueue };
    }
    case 'PLAYBACK_RESET_PLAYLIST_QUEUE':
      return { ...state, playlistQueue: [] };
    case 'PLAYBACK_ORDERQUEUE_NEW_VALUE': {
      const { songId, itemId } = payload;
      const { orderQueue } = state;
      orderQueue.push({
        songId,
        itemId,
      });
      return { ...state, orderQueue };
    }
    case 'PLAYBACK_ORDERQUEUE_SONG_DETAIL': {
      const { orderQueue } = state;
      const { song, itemId } = payload;
      for (let i = orderQueue.length - 1; i >= 0; i--) {
        if (orderQueue[i].itemId === itemId) {
          orderQueue[i].song = song;
          break;
        }
      }
      return { ...state, orderQueue };
    }
    case 'PLAYBACK_ORDERQUEUE_REMOVE_VALUE': {
      const { orderQueue } = state;
      const { itemId } = payload;
      for (let i = 0; i < orderQueue.length; i++) {
        if (orderQueue[i].itemId === itemId) {
          orderQueue.splice(i, 1);
          break;
        }
      }
      return { ...state, orderQueue };
    }
    case 'PLAYBACK_TOGGLE_QUEUE':
      return { ...state, queueOpen: !state.queueOpen };
    case 'PLAYBACK_OPEN_CONTEXT_MENU':
      return { ...state, contextMenuOpen: true, contextMenuAnchor: payload.anchor, songId: payload.songId };
    case 'PLAYBACK_CLOSE_CONTEXT_MENU':
      return { ...state, contextMenuOpen: false, contextMenuAnchor: null, songId: null };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
