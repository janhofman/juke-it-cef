import {makeCancelable} from './../utils';

export function makeStatic(){
    return {
        type: 'SONGLIST_MAKE_STATIC',
    };
}

export function makeSelectable(playlistId){
    return {
        type: 'SONGLIST_MAKE_SELECTABLE',
        payload: playlistId,
    }
}

export function closeOptions(){
    return {
        type: 'SONGLIST_CLOSE_OPTIONS'
    };
}

export function openOptions(target){
    return {
        type: 'SONGLIST_OPEN_OPTIONS',
        payload: target,
    };
}

export function selectionChanged(selected){
    return {
        type: 'SONGLIST_SELECTION_CHANGED',
        payload: selected,
    };
}

export function songsChange(loaded, songs){
    return {
        type: 'SONGLIST_SONGS_CHANGE',
        payload: {songsLoaded: loaded, songs: songs},
    };
}

export function setSongsPromise(songsPromise){
    return {
        type: 'SONGLIST_SET_SONGS_PROMISE',
        payload: songsPromise,
    };
}

export function openContextMenu(target, songId){
    return {
        type: 'SONGLIST_OPEN_CONTEXT_MENU',
        payload: {anchor: target, songId: songId},
    };
}

export function closeContextMenu(){
    return {
        type: 'SONGLIST_CLOSE_CONTEXT_MENU',
    };
}

export function clearSongs(){
    return (dispatch, getState) => {
        const {songsPromise} = getState();
        if(songsPromise){
            songsPromise.cancel();
        }
        dispatch(songsChange(false, []));
    }
}
export function metadataChange(loaded, title, subtitle){
    return {
        type: 'SONGLIST_METADATA_CHANGE',
        payload: {
            metadataLoaded: loaded,
            title: title,
            subtitle: subtitle,
        },
    };
}

export function setMetadataPromise(metadataPromise){
    return {
        type: 'SONGLIST_SET_METADATA_PROMISE',
        payload: metadataPromise,
    }
}

export function clearMetadata(){
    return (dispatch, getState) => {
        const {metadataPromise} = getState();
        if(metadataPromise){
            metadataPromise.cancel();
        }
        dispatch(metadataChange(false, null, null));
    }
}
export function clear(){
    return (dispatch) => {
        dispatch(clearSongs());
        dispatch(clearMetadata());
    }
}

export function loadSongsForPlaylist(playlistId){
    return((dispatch, getState) => {
        const {sqlite} = getState();
        dispatch(clearSongs());        
        var newPromise = new Promise((resolve, reject) => {
            sqlite.all('SELECT s.* FROM songView AS s INNER JOIN playlistSong AS ps ON (ps.songId = s.id) WHERE ps.playlistId = ?',
                {1: playlistId},
                (err, rows) => {
                    if(err){
                        reject(err);
                    }
                    else if(rows){
                        resolve(rows);
                    }
                    else{
                        reject('Null or undefined');
                    }
                }
            );
        });
        newPromise = makeCancelable(newPromise);
        newPromise.promise
            .then((songs) => dispatch(songsChange(true, songs)))
            .catch((err) => console.log(err)); // TODO: add catch
        dispatch(setSongsPromise(newPromise));
    });
}

export function loadMetadataForPlaylist(playlistId){
    return((dispatch, getState) => {
        const {sqlite} = getState();
        dispatch(clearMetadata());        
        var infoPromise = new Promise((resolve, reject) => {
            sqlite.get('SELECT name, description FROM playlist WHERE id = ?',
                {1: playlistId},
                (err, row) => {
                    if(err){
                        reject(err);
                    }
                    else if(row){
                        resolve(row);
                    }
                    else{
                        reject('Null or undefined');
                    }
                }
            );
        });
        infoPromise = makeCancelable(infoPromise);
        infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, info.description)))
            .catch((err) => console.log(err)); // TODO: add catch
        dispatch(setMetadataPromise(infoPromise));
    });
}

export function loadSongsForGenre(genreId){
    return((dispatch, getState) => {
        const {sqlite} = getState();
        dispatch(clearSongs());        
        var newPromise = new Promise((resolve, reject) => {
            sqlite.all('SELECT sv.* FROM songView AS sv INNER JOIN song AS s ON (s.id = sv.id) WHERE s.genreId = ?',
                {1: genreId},
                (err, rows) => {
                    if(err){
                        reject(err);
                    }
                    else if(rows){
                        resolve(rows);
                    }
                    else{
                        reject('Null or undefined');
                    }
                }
            );
        });
        newPromise = makeCancelable(newPromise);
        newPromise.promise
            .then((songs) => dispatch(songsChange(true, songs)))
            .catch((err) => console.log(err)); // TODO: add catch
        dispatch(setSongsPromise(newPromise));
    });
}

export function loadMetadataForGenre(genreId){
    return((dispatch, getState) => {
        const {sqlite} = getState();
        dispatch(clearMetadata());        
        var infoPromise = new Promise((resolve, reject) => {
            sqlite.get('SELECT name FROM genre WHERE id = ?',
                {1: genreId},
                (err, row) => {
                    if(err){
                        reject(err);
                    }
                    else if(row){
                        resolve(row);
                    }
                    else{
                        reject('Null or undefined');
                    }
                }
            );
        });
        infoPromise = makeCancelable(infoPromise);
        infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, null)))
            .catch((err) => console.log(err)); // TODO: add catch
        dispatch(setMetadataPromise(infoPromise));
    });
}

export function loadSongsForArtist(artistId){
    return((dispatch, getState) => {
        const {sqlite} = getState();
        dispatch(clearSongs());        
        var newPromise = new Promise((resolve, reject) => {
            sqlite.all('SELECT sv.* FROM songView AS sv INNER JOIN song AS s ON (s.id = sv.id) WHERE s.artistId = ?',
                {1: artistId},
                (err, rows) => {
                    if(err){
                        reject(err);
                    }
                    else if(rows){
                        resolve(rows);
                    }
                    else{
                        reject('Null or undefined');
                    }
                }
            );
        });
        newPromise = makeCancelable(newPromise);
        newPromise.promise
            .then((songs) => dispatch(songsChange(true, songs)))
            .catch((err) => console.log(err)); // TODO: add catch
        dispatch(setSongsPromise(newPromise));
    });
}

export function loadMetadataForArtist(artistId){
    return((dispatch, getState) => {
        const {sqlite} = getState();
        dispatch(clearMetadata());        
        var infoPromise = new Promise((resolve, reject) => {
            sqlite.get('SELECT name FROM artist WHERE id = ?',
                {1: artistId},
                (err, row) => {
                    if(err){
                        reject(err);
                    }
                    else if(row){
                        resolve(row);
                    }
                    else{
                        reject('Null or undefined');
                    }
                }
            );
        });
        infoPromise = makeCancelable(infoPromise);
        infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, null)))
            .catch((err) => console.log(err)); // TODO: add catch
        dispatch(setMetadataPromise(infoPromise));
    });
}

export function loadSongsForAlbum(albumId){
    return((dispatch, getState) => {
        const {sqlite} = getState();
        dispatch(clearSongs());        
        var newPromise = new Promise((resolve, reject) => {
            sqlite.all('SELECT sv.* FROM songView AS sv INNER JOIN song AS s ON (s.id = sv.id) WHERE s.albumId = ?',
                {1: albumId},
                (err, rows) => {
                    if(err){
                        reject(err);
                    }
                    else if(rows){
                        resolve(rows);
                    }
                    else{
                        reject('Null or undefined');
                    }
                }
            );
        });
        newPromise = makeCancelable(newPromise);
        newPromise.promise
            .then((songs) => dispatch(songsChange(true, songs)))
            .catch((err) => console.log(err)); // TODO: add catch
        dispatch(setSongsPromise(newPromise));
    });
}

export function loadMetadataForAlbum(albumId){
    return((dispatch, getState) => {
        const {sqlite} = getState();
        dispatch(clearMetadata());        
        var infoPromise = new Promise((resolve, reject) => {
            sqlite.get('SELECT alb.name, a.name as artistName FROM album AS alb INNER JOIN artist AS a ON(alb.artistId = a.id) WHERE alb.id = ?',
                {1: albumId},
                (err, row) => {
                    if(err){
                        reject(err);
                    }
                    else if(row){
                        resolve(row);
                    }
                    else{
                        reject('Null or undefined');
                    }
                }
            );
        });
        infoPromise = makeCancelable(infoPromise);
        infoPromise.promise
            .then((info) => dispatch(metadataChange(true, info.name, info.artistName)))
            .catch((err) => console.log(err)); // TODO: add catch
        dispatch(setMetadataPromise(infoPromise));
    });
}


