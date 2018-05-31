const initialState = {
  songsLoaded: false,
  songs: [],
  songsPromise: null,
  title: null,
  subtitle: null,
  metadataLoaded: false,
  metadataPromise: null,
  optionsOpen: false,
  optionsAnchor: null,
  selectable: false,
  selected: [],
  playlistId: null,
  songId: null,
  contextMenuOpen: false,
  contextMenuAnchor: null,
};

export default function reducer(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case 'SONGLIST_SONGS_CHANGE':
      return { ...state, songs: payload.songs, songsLoaded: payload.songsLoaded };
    case 'SONGLIST_SET_SONGS_PROMISE':
      return { ...state, songsPromise: payload };
    case 'SONGLIST_METADATA_CHANGE':
      return {
        ...state,
        title: payload.title,
        subtitle: payload.subtitle,
        metadataLoaded: payload.metadataLoaded,
      };
    case 'SONGLIST_SET_METADATA_PROMISE':
      return { ...state, metadataPromise: payload };
    case 'SONGLIST_MAKE_SELECTABLE':
      return { ...state, selectable: true, playlistId: payload };
    case 'SONGLIST_MAKE_STATIC':
      return { ...state, selectable: false, playlistId: null };
    case 'SONGLIST_CLOSE_OPTIONS':
      return { ...state, optionsOpen: false, optionsAnchor: null };
    case 'SONGLIST_OPEN_OPTIONS':
      return { ...state, optionsOpen: true, optionsAnchor: payload };
    case 'SONGLIST_OPEN_CONTEXT_MENU':
      return { ...state, contextMenuOpen: true, contextMenuAnchor: payload.anchor, songId: payload.songId };
    case 'SONGLIST_CLOSE_CONTEXT_MENU':
      return { ...state, contextMenuOpen: false, contextMenuAnchor: null, songId: null };
    case 'SONGLIST_SELECTION_CHANGED':
      return { ...state, selected: payload };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
