import firebase from 'firebase';
// import fs from 'fs';
// import sqlite3 from 'sqlite3';

const firebaseConfig = {
  apiKey: 'AIzaSyD5cr_tEZR8FmHBZF9gVOd-mYL52v4reKQ',
  authDomain: 'mixitfirebase.firebaseapp.com',
  databaseURL: 'https://mixitfirebase.firebaseio.com',
  storageBucket: 'mixitfirebase.appspot.com',
  messagingSenderId: '458619177042',
};
 /* try{
    fs.accessSync('data.dat', fs.constants.R_OK | fs.constants.W_OK);
}catch(err){
    var db = new sqlite3.cached.Database("data.dat");
    db.exec(
        `CREATE TABLE artist(id INTEGER PRIMARY KEY ASC, name TEXT UNIQUE NOT NULL);
        CREATE TABLE genre(id INTEGER PRIMARY KEY ASC, name TEXT UNIQUE NOT NULL);
        CREATE TABLE album(id INTEGER PRIMARY KEY ASC, name TEXT NOT NULL, artistId INTEGER
        CONSTRAINT fk_artist_album REFERENCES artist(id), CONSTRAINT uq_album_name_artist UNIQUE (name, artistId) ON CONFLICT IGNORE);
        CREATE TABLE song(id INTEGER PRIMARY KEY ASC, title TEXT, artistId INTEGER CONSTRAINT fk_artist_song REFERENCES artist(id),
        albumId INTEGER CONSTRAINT fk_album_song REFERENCES album(id), genreId INTEGER CONSTRAINT fk_genre_song REFERENCES genre(id),
        length INTEGER, path TEXT UNIQUE NOT NULL);
        CREATE TABLE variables(name TEXT PRIMARY KEY NOT NULL, intValue INTEGER, textValue TEXT);
        CREATE TABLE playlist(id INTEGER PRIMARY KEY ASC, name TEXT NOT NULL, description TEXT, usr TEXT NOT NULL,
        CONSTRAINT uq_playlist UNIQUE(name, usr) ON CONFLICT IGNORE);
        CREATE TABLE playlistSong(songId INTEGER NOT NULL CONSTRAINT fk_song_playlistSong REFERENCES song(id) ON DELETE CASCADE,
        playlistId INTEGER NOT NULL CONSTRAINT fk_playlist_playlistSong REFERENCES playlist(id) ON DELETE CASCADE,
        CONSTRAINT pk_playlistSong PRIMARY KEY(songId, playlistId) ON CONFLICT IGNORE);
        CREATE INDEX ix_playlistId_playlistSong ON playlistSong(playlistId);
        CREATE INDEX ix_usr_playlist ON playlist(usr);
        CREATE VIEW songView AS SELECT s.id, s.title, s.length, s.path, CASE WHEN s.artistId IS NULL THEN NULL ELSE a.name END AS artist,
        CASE WHEN s.albumId IS NULL THEN NULL ELSE alb.name END AS album, CASE WHEN s.genreId IS NULL THEN NULL ELSE g.name END AS genre
        FROM song AS s LEFT JOIN artist AS a ON (s.artistId = a.id) LEFT JOIN album AS alb ON (s.albumId = alb.id) LEFT JOIN genre AS g ON (s.genreId = g.id)`
    );
} */
export default {
  firebase: firebase.initializeApp(firebaseConfig),
    // sqlite: new sqlite3.cached.Database("data.dat"),
  cefQuery: window.cefQuery,
};
