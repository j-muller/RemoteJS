/*
 * RemoteJS
 * Control your music from your browser.
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

var clone = require('clone');

rjs.album = {

    /* Store album's title */
    title: null,

    /* Store reference on artist (index from artists arrray) */
    artist: null,

    /* Store reference on song (index from songs array) */
    songs: []

};

rjs.song = {

    /* Store song's title */
    title: null,

    /* Store iTunes item ID of the song */
    itemId: null,

    /* Store reference on artist (index from artists arrray) */
    artist: null,

    /* Store song's length (in seconds) */
    length: null,

    /* Store reference on album (index from albums array) */
    album: null,

    /* true if song has artwork, otherwise false */
    hasArtwork: false

};

rjs.artist = {

    /* Store artist's name */
    name: null,

    /* Store reference on song (index from songs array) */
    songs: [],

    /* Store reference on album (index from albums array) */
    albums: [],

    /* true if artist has artwork, otherwise false */
    hasArtwork: false

};

rjs.library = {

    /* Array of album object containing in the library */
    albums: [],

    /* Array of songs object containing in the library */
    songs: [],

    /* Array of artists object containing in the library */
    artists: [],

    getOrCreateArtist: function (artistName, songIdx) {
        var artist    = null;
        var len       = rjs.library.artists.length;
        var artistIdx = 0;

        for (; artistIdx < len; artistIdx++) {
            if (artistName.toLowerCase() == rjs.library.artists[artistIdx].name.toLowerCase()) {
                artist = rjs.library.artists[artistIdx];
                break;
            }
        }

        if (artist === null) {
            artist = clone(rjs.artist);
            artist.name = rjs.utils.trim(artistName);
            artist.songs.push(songIdx);

            rjs.library.artists.push(artist);

            return rjs.library.artists.length - 1;
        }

        artist.songs.push(songIdx);
        return artistIdx;
    },

    getOrCreateAlbum: function (albumTitle, artistIdx, songIdx) {
        var album    = null;
        var len      = rjs.library.albums.length;
        var albumIdx = 0;

        for (; albumIdx < len; albumIdx++) {
            if (albumTitle.toLowerCase() == rjs.library.albums[albumIdx].title.toLowerCase()) {
                album = rjs.library.albums[albumIdx];
                break;
            }
        }

        if (album === null) {
            album = clone(rjs.album);
            album.title = albumTitle.trim();
            album.artist = artistIdx;

            album.songs.push(songIdx);
            rjs.library.albums.push(album);

            return rjs.library.albums.length - 1;
        }

        album.songs.push(songIdx);
        return albumIdx;
    },

    addSong: function (itunesSong) {
        var artist   = null;
        var album    = null;
        var song     = null;

        song        = clone(rjs.song);
        song.title  = itunesSong['dmap.itemname'].trim();
        song.length = itunesSong['daap.songtime'];
        song.itemId = itunesSong['dmap.itemid'];

        if (itunesSong['daap.songartist'] != null)
            artist = rjs.library.getOrCreateArtist(itunesSong['daap.songartist'], rjs.library.songs.length);

        if (itunesSong['daap.songalbum'] != null) {
            album = rjs.library.getOrCreateAlbum(itunesSong['daap.songalbum'], artist, rjs.library.songs.length);

            if (artist !== null && rjs.library.artists[artist].albums.indexOf(album) == -1)
                rjs.library.artists[artist].albums.push(album);
        }

        song.artist = artist;
        song.album = album;

        rjs.library.songs.push(song);
    }

};

module.exports = rjs.library;