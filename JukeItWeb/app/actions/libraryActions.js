import {makeCancelable, Song} from './../utils';
//import mm from 'musicmetadata';
//import fs from 'fs';
//import path from 'path';

export function setLoading(loading){
    return {
        type: 'LIBRARY_LOADING',
        payload: loading,
    }    
}

// CHANGE

export function songsChange(loaded, songs){
    return {
        type: 'LIBRARY_SONGS_CHANGE',
        payload: {songsLoaded: loaded, songs: songs},
    }    
}

export function artistsChange(loaded, artists){
    return {
        type: 'LIBRARY_ARTISTS_CHANGE',
        payload: {artistsLoaded: loaded, artists: artists},
    }    
}

export function albumsChange(loaded, albums){
    return {
        type: 'LIBRARY_ALBUMS_CHANGE',
        payload: {albumsLoaded: loaded, albums: albums},
    }    
}

export function genresChange(loaded, genres){
    return {
        type: 'LIBRARY_GENRES_CHANGE',
        payload: {genresLoaded: loaded, genres: genres},
    }    
}

// PROMISE

export function setSongsPromise(promise){
    return {
        type: 'LIBRARY_SET_PROMISE_SONGS',
        payload: promise,
    }
}

export function setAlbumsPromise(promise){
    return {
        type: 'LIBRARY_SET_PROMISE_ALBUMS',
        payload: promise,
    }
}

export function setArtistsPromise(promise){
    return {
        type: 'LIBRARY_SET_PROMISE_ARTISTS',
        payload: promise,
    }
}

export function setGenresPromise(promise){
    return {
        type: 'LIBRARY_SET_PROMISE_GENRES',
        payload: promise,
    }
}

// CLEAN

export function cleanSongs(){
    return (dispatch, getState) => {
        const {songsPromise} = getState().library;
        if(songsPromise){
            songsPromise.cancel();
        }
        dispatch(songsChange(false, []));
    }
}

export function cleanAlbums(){
    return (dispatch, getState) => {
        const {albumsPromise} = getState().library;
        if(albumsPromise){
            albumsPromise.cancel();
        }
        dispatch(albumsChange(false, []));
    }
}

export function cleanArtists(){
    return (dispatch, getState) => {
        const {artistsPromise} = getState().library;
        if(artistsPromise){
            artistsPromise.cancel();
        }
        dispatch(artistsChange(false, []));
    }
}

export function cleanGenres(){
    return (dispatch, getState) => {
        const {genresPromise} = getState().library;
        if(genresPromise){
            genresPromise.cancel();
        }
        dispatch(genresChange(false, []));
    }
}

export function cleanLibrary(){
    return (dispatch) => {
        dispatch(cleanAlbums());
        dispatch(cleanArtists());
        dispatch(cleanGenres());
        dispatch(cleanSongs());
    }
}

// LOAD

export function loadSongs(){
    return (dispatch, getState) => {
        const {sqlite, library} = getState();
        const {songsLoaded} = library;
        if(!songsLoaded){
            dispatch(cleanSongs);
            var promise = new Promise((resolve, reject) => {
                // TODO use songView
                sqlite.all('SELECT s.id, s.title, s.length, s.path, CASE WHEN s.artistId IS NULL THEN NULL ELSE a.name END AS artist, '
                + 'CASE WHEN s.albumId IS NULL THEN NULL ELSE alb.name END AS album, CASE WHEN s.genreId IS NULL THEN NULL ELSE g.name END AS genre '
                + 'FROM song AS s LEFT JOIN artist AS a ON (s.artistId = a.id) LEFT JOIN album AS alb ON (s.albumId = alb.id) LEFT JOIN genre AS g ON (s.genreId = g.id)', 
                (err, rows) => {
                    if(err){
                        reject(err);
                    }
                    else if(rows){
                        resolve(rows);
                    }
                    else{
                        reject('null or undefined:', rows);
                    }
                }
            );
            });
            promise = makeCancelable(promise);
            promise.promise
                .then((songs) => dispatch(songsChange(true, songs)))
                .catch((err) => console.log(err));  // TODO: add catch
            dispatch(setSongsPromise(promise));
        } 
    }
}

export function loadAlbums(){
    return (dispatch, getState) => {
        const {sqlite, library} = getState();
        const {albumsLoaded} = library;
        if(!albumsLoaded){
            dispatch(cleanAlbums());            
            var promise = new Promise((resolve, reject) => {
                sqlite.all('SELECT alb.id, alb.name, a.name AS artistName FROM album AS alb INNER JOIN artist AS a ON(alb.artistId = a.id)', 
                    (err, rows) => {
                        if(err){
                            reject(err);
                        }
                        else if(rows){
                            resolve(rows);
                        }
                        else{
                            reject('null or undefined:', rows);
                        }
                    }
                );
            });
            promise = makeCancelable(promise);
            promise.promise
                .then((albums) => dispatch(albumsChange(true, albums)))
                .catch((err) => console.log(err));  // TODO: add catch
            dispatch(setAlbumsPromise(promise));
        }      
    }
}

export function loadArtists(){
    return (dispatch, getState) => {
        const {sqlite, library} = getState();
        const {artistsLoaded} = library;
        if(!artistsLoaded){
            dispatch(cleanArtists());            
            var promise = new Promise((resolve, reject) => {
                sqlite.all('SELECT id, name FROM artist', 
                    (err, rows) => {
                        if(err){
                            reject(err);
                        }
                        else if(rows){
                            resolve(rows);
                        }
                        else{
                            reject('null or undefined:', rows);
                        }
                    }
                );
            });
            promise = makeCancelable(promise);
            promise.promise
                .then((artists) => dispatch(artistsChange(true, artists)))
                .catch((err) => console.log(err));  // TODO: add catch
            dispatch(setArtistsPromise(promise));
        }      
    }
}

export function loadGenres(){
    return (dispatch, getState) => {
        const {sqlite, library} = getState();
        const {genresLoaded} = library;
        if(!genresLoaded){
            dispatch(cleanGenres());            
            var promise = new Promise((resolve, reject) => {
                sqlite.all('SELECT id, name FROM genre', 
                    (err, rows) => {
                        if(err){
                            reject(err);
                        }
                        else if(rows){
                            resolve(rows);
                        }
                        else{
                            reject('null or undefined:', rows);
                        }
                    }
                );
            });
            promise = makeCancelable(promise);
            promise.promise
                .then((genres) => dispatch(genresChange(true, genres)))
                .catch((err) => console.log(err));  // TODO: add catch
            dispatch(setGenresPromise(promise));
        }      
    }
}

export function addSongs(songs){
    return (dispatch, getState) => {
        const {sqlite, } = getState();
        dispatch(setLoading(true));
        let operations = [];
        songs.forEach((element) => {
            const stats = fs.statSync(element)
            const fileSizeInBytes = stats.size
            var readableStream = fs.createReadStream(element);
            var song = new Song();
            operations.push(new Promise((resolve, reject) => {
                var parser = mm(readableStream, {duration: true, fileSize: fileSizeInBytes}, function (err, metadata) {
                    // close the stream first
                    readableStream.close();
                    
                    if (err) {
                        console.log("An error occured : ", err);
                        song.title = path.parse(element).name;
                        song.path = element;
                    }
                    else{
                        console.log(metadata);
                        song.album = metadata.album;
                        song.artist = metadata.artist.length > 0 ? metadata.artist[0] : null;
                        song.title = metadata.title.length > 0 ? metadata.title : path.parse(element).name,
                        song.length = Math.round(metadata.duration * 1000);
                        song.genre = metadata.genre.length > 0 ? metadata.genre[0] : null;
                        song.path = element;
                    }      
                    sqlite.serialize(() => {                  
                        sqlite.run('INSERT OR IGNORE INTO genre (name) VALUES (?)', {1: song.genre});
                        sqlite.run('INSERT OR IGNORE INTO artist (name) VALUES (?);', {1: song.artist});
                        sqlite.run('REPLACE INTO variables(name, intValue) VALUES (\'artist\', NULL);');
                        sqlite.run('UPDATE variables SET intValue = (SELECT id FROM artist WHERE name = ?)'
                        + ' WHERE name = \'artist\';', {1: song.artist});
                        sqlite.run('INSERT OR IGNORE INTO album(artistId, name) VALUES ((SELECT intValue '
                        + 'FROM variables WHERE name = \'artist\'), ?);', {1: song.album});
                        sqlite.run('REPLACE INTO variables(name, intValue) VALUES (\'album\', NULL);');
                        sqlite.run('REPLACE INTO variables(name, intValue) VALUES (\'genre\', NULL);');
                        sqlite.run('UPDATE variables SET intValue = (SELECT id FROM genre WHERE name = ?) '
                        + 'WHERE name = \'genre\';', {1: song.genre});
                        sqlite.run('UPDATE variables SET intValue = (SELECT id FROM album WHERE name = ? '
                        + 'AND artistId = (SELECT intValue FROM variables WHERE name = \'artist\')) '
                        + 'WHERE name = \'album\';', {1: song.album});
                        sqlite.run('INSERT OR IGNORE INTO song(title, artistId, albumId, genreId, length, path) VALUES('
                        + '$t, (SELECT intValue FROM variables WHERE name = \'artist\'),' 
                        + '(SELECT intValue FROM variables WHERE name = \'album\'),'
                        + '(SELECT intValue FROM variables WHERE name = \'genre\'), $l, $p);',
                        {$t: song.title, $l: song.length, $p: song.path});
                        sqlite.run('DELETE FROM variables WHERE name IN (\'artist\', \'genre\', \'album\');', (err) => {
                            if(err){
                                reject(err);
                            }
                            else{
                                resolve();
                            }
                        });     
                    });               
                });
            }));
        }, this);
        Promise.all(operations).then(() => {
            dispatch(cleanLibrary());
            dispatch(setLoading(false));
        }).catch((err) => console.log(err)); // TODO: handle error
    }
}