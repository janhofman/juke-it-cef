import {makeCancelable} from './../utils';

export function showDialog(show){
    return {
        type: 'PLAYLISTS_SHOW_DIALOG',
        payload: show,
    } 
}

export function playlistsChange(loaded, playlists){
    return {
        type: 'PLAYLISTS_CHANGE',
        payload: {playlists: playlists, playlistsLoaded: loaded},
    }    
}

export function setPlaylistsPromise(promise){
    return {
        type: 'PLAYLISTS_SET_PROMISE',
        payload: promise,
    }
}

export function cleanPlaylists(){
    return (dispatch, getState) => {
        const {playlistsPromise} = getState().playlists;
        if(playlistsPromise){
            playlistsPromise.cancel();
        }
        dispatch(playlistsChange(false, []));
    }
}

export function loadPlaylists(){
    return (dispatch, getState) => {
        const {sqlite, playlists, userData} = getState();
        const {playlistsLoaded} = playlists;
        const {userId} = userData;
        if(!playlistsLoaded){
            dispatch(cleanPlaylists());            
            var promise = new Promise((resolve, reject) => {
                sqlite.all('SELECT p.id, p.name, p.description FROM playlist AS p WHERE p.usr = ?',
                    {1: userId}, 
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
                .then((playlists) => dispatch(playlistsChange(true, playlists)))
                .catch((err) => console.log(err));  // TODO: add catch
            dispatch(setPlaylistsPromise(promise));
        }      
    }
}

export function addNewPlaylist(name, description){
    return (dispatch, getState) => {
        const {sqlite, userData} = getState();
        const {userId} = userData;
        sqlite.run('INSERT INTO playlist(name, description, usr) VALUES(?1, ?2, ?3)',
            {1: name, 2: description, 3: userId},
            (err) => {
                if(err){
                    console.log("Error in addNewPlaylist", err); // TODO: handle catch
                }
                else{
                    dispatch(cleanPlaylists());
                    dispatch(loadPlaylists());
                    dispatch(showDialog(false));
                }
            }
        );
    }
}

export function addSongsToPlaylist(playlistId, songs){
    return (dispatch, getState) => {
        const {sqlite} = getState();
        let sql = 'INSERT OR IGNORE INTO playlistSong(playlistId, songId) VALUES ';
        let params = [];
        let comma = false;
        for(var i = 0; i < songs.length; i++){
            if(comma){
                sql += ',';
            }
            sql += '(? , ?)';
            params.push(playlistId, songs[i]);
            comma = true;
        }
        console.log(sql);
        sqlite.run(
            sql,
            params,
            (err) => {
                if(err){
                    console.log("addSongsToPlaylist", err);
                }
                else{
                    dispatch(cleanPlaylists());
                }
            }
        );
    }

}