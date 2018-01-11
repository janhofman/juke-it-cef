const initialState = {
    loading: false,
    songs: [],
    songsLoaded: false,
    songsPromise: null,
    artists: [],
    artistsLoaded: false,
    artistsPromise: null,
    albums: [],
    albumsLoaded: false,
    albumsPromise: null,
    genres: [],
    genresLoaded: false,
    genresPromise: null,
}

export default function reducer(state=initialState, action){
    const {type, payload} = action;
    switch(action.type){
        case 'LIBRARY_LOADING':
            return {...state, loading: payload};
        
        // change
        case 'LIBRARY_SONGS_CHANGE':
            return {...state, songs: payload.songs, songsLoaded: payload.songsLoaded};
        case 'LIBRARY_ALBUMS_CHANGE':
            return {...state, albums: payload.albums, albumsLoaded: payload.albumsLoaded};
        case 'LIBRARY_ARTISTS_CHANGE':
            return {...state, artists: payload.artists, artistsLoaded: payload.artistsLoaded};
        case 'LIBRARY_GENRES_CHANGE':
            return {...state, genres: payload.genres, genresLoaded: payload.genresLoaded};
        
        // promise
        case 'LIBRARY_SET_PROMISE_SONGS':
            return {...state, songsPromise: payload};
        case 'LIBRARY_SET_PROMISE_ALBUMS':
            return {...state, albumsPromise: payload};
        case 'LIBRARY_SET_PROMISE_ARTISTS':
            return {...state, artistsPromise: payload};
        case 'LIBRARY_SET_PROMISE_GENRES':
            return {...state, genresPromise: payload};
                  
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}