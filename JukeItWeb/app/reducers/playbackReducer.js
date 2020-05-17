const initialState = {
  activePlaylist: null,
  playbackReady: false,
  playbackStarted: false,
  playlistQueue: [],
  orderQueue: [],
  priorityQueue: [],
  randomSongsArray: [],
  queueOpen: false,
  contextMenuOpen: false,
  contextMenuAnchor: null,
  songId: null,
  orderQueueOpen: false,
  playlistQueueOpen: false,
  priorityQueueOpen: false,
  availableSongsOpen: true,
  fileserverAddress: null,
};

export default function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case 'PLAYBACK_PLAYLIST_CHANGED':
      return { ...state, 
        activePlaylist: payload.playlist, 
        fileserverAddress: payload.fileserverAddress,
        playbackReady: (payload !== null), 
        randomSongsArray: []
      };
    case 'PLAYBACK_SET_FILESERVER_ADDRESS':
      return { ...state, fileserverAddress: payload };
    case 'PLAYBACK_ADD_PLAYLIST_QUEUE': {
      const { playlistQueue } = state;
      const { songId, itemId } = payload;      
      return { ...state, playlistQueue: [...playlistQueue, { songId, itemId }] };
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
    case 'PLAYBACK_START':
      return { ...state, playbackStarted: true, };      
    case 'PLAYBACK_STOP':
      return { ...state, playbackStarted: false, };
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
      return { ...state, orderQueue: [...orderQueue, { songId, itemId }] };
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
      let newQueue = [...orderQueue]
      for (let i in orderQueue) {
        if (orderQueue[i].itemId === itemId) {
          let newQueue = [...orderQueue];
          newQueue.splice(i, 1);
          return { ...state, orderQueue: newQueue };
        }
      }
      return { ...state };
    }
    case 'PLAYBACK_REMOVE_QUEUE_ITEM': {
      const { 
        priorityQueue,
        orderQueue,
        playlistQueue,
      } = state;
      const { itemId } = payload;
      for (let i in priorityQueue) {
        if (priorityQueue[i].itemId === itemId) {
          let newQueue = [...priorityQueue];
          newQueue.splice(i, 1);
          return { ...state, priorityQueue: newQueue };
        }
      }
      for (let i in orderQueue) {
        if (orderQueue[i].itemId === itemId) {
          let newQueue = [...orderQueue];
          newQueue.splice(i, 1);
          return { ...state, orderQueue: newQueue };
        }
      }
      for (let i in playlistQueue) {
        if (playlistQueue[i].itemId === itemId) {
          let newQueue = [...playlistQueue];
          newQueue.splice(i, 1);
          return { ...state, playlistQueue: newQueue };
        }
      }
      return { ...state};
    }
    case 'PLAYBACK_TOGGLE_QUEUE':
      return { ...state, queueOpen: !state.queueOpen };
    case 'PLAYBACK_OPEN_CONTEXT_MENU':
      return { ...state, contextMenuOpen: true, contextMenuAnchor: payload.anchor, songId: payload.songId };
    case 'PLAYBACK_CLOSE_CONTEXT_MENU':
      return { ...state, contextMenuOpen: false, contextMenuAnchor: null, songId: null };
    case 'PLAYBACK_TOGGLE_AVAILABLE_SONGS':
      return { ...state, availableSongsOpen: !state.availableSongsOpen };
    case 'PLAYBACK_TOGGLE_PLAYLIST_QUEUE':
      return { ...state, playlistQueueOpen: !state.playlistQueueOpen };
    case 'PLAYBACK_TOGGLE_PRIORITY_QUEUE':
      return { ...state, priorityQueueOpen: !state.priorityQueueOpen };
    case 'PLAYBACK_TOGGLE_ORDER_QUEUE':
      return { ...state, orderQueueOpen: !state.orderQueueOpen };
    case 'PLAYBACK_PLAYLIST_QUEUE_ADD': {
      const { playlistQueue } = state;
      const { songId, itemId } = payload;      
      return { ...state, playlistQueue: [...playlistQueue, { songId, itemId }] };
    }
    case 'PLAYBACK_PRIORITY_QUEUE_ADD': {
      const { priorityQueue } = state;
      const { songId, itemId } = payload;      
      return { ...state, priorityQueue: [...priorityQueue, { songId, itemId }] };
    }
    case 'PLAYBACK_SET_RANDOM_ARRAY': {
      return { ...state, randomSongsArray: payload };
    }
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
