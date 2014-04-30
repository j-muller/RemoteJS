/*
 * RemoteJS
 * Control your music from your browser.
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

var clone = require('clone');

var models = {

    /* Album model */
    album: {
        /* Store album's title */
        title: null,

        /* Store reference on artist (index from artists arrray) */
        artist: null,

        /* Store reference on song (index from songs array) */
        songs: []
    },

    /* Song model */
    song: {
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
        hasArtwork: false,

        /* Plugin name */
        plugin: 'itunes'
    },

    /* Artist model */
    artist: {
        /* Store artist's name */
        name: null,

        /* Store reference on song (index from songs array) */
        songs: [],

        /* Store reference on album (index from albums array) */
        albums: [],

        /* true if artist has artwork, otherwise false */
        hasArtwork: false        
    }
};

var library = {

    /* Array of album object containing in the library */
    albums: [],

    /* Array of songs object containing in the library */
    songs: [],

    /* Array of artists object containing in the library */
    artists: [],

    getOrCreateArtist: function (artistName, songIdx) {
        var artist    = null;
        var len       = library.artists.length;
        var artistIdx = 0;

        for (; artistIdx < len; artistIdx++) {
            if (artistName.toLowerCase() == library.artists[artistIdx].name.toLowerCase()) {
                artist = library.artists[artistIdx];
                break;
            }
        }

        if (artist === null) {
            artist = clone(models.artist);
            artist.name = rjs.utils.trim(artistName); // TODO
            artist.songs.push(songIdx);

            library.artists.push(artist);

            return library.artists.length - 1;
        }

        artist.songs.push(songIdx);
        return artistIdx;
    },

    getOrCreateAlbum: function (albumTitle, artistIdx, songIdx) {
        var album    = null;
        var len      = library.albums.length;
        var albumIdx = 0;

        for (; albumIdx < len; albumIdx++) {
            if (albumTitle.toLowerCase() == library.albums[albumIdx].title.toLowerCase()) {
                album = library.albums[albumIdx];
                break;
            }
        }

        if (album === null) {
            album = clone(models.album);
            album.title = albumTitle.trim();
            album.artist = artistIdx;

            album.songs.push(songIdx);
            library.albums.push(album);

            return library.albums.length - 1;
        }

        album.songs.push(songIdx);
        return albumIdx;
    },

    addSong: function (itunesSong) {
        var artist   = null;
        var album    = null;
        var song     = null;

        song        = clone(models.song);
        song.title  = itunesSong['dmap.itemname'].trim();
        song.length = itunesSong['daap.songtime'];
        song.itemId = itunesSong['dmap.itemid'];

        if (itunesSong['daap.songartist'] != null)
            artist = library.getOrCreateArtist(itunesSong['daap.songartist'], library.songs.length);

        if (itunesSong['daap.songalbum'] != null) {
            album = library.getOrCreateAlbum(itunesSong['daap.songalbum'], artist, library.songs.length);

            if (artist !== null && library.artists[artist].albums.indexOf(album) == -1)
                library.artists[artist].albums.push(album);
        }

        song.artist = artist;
        song.album = album;

        library.songs.push(song);
    }

};

module.exports = library;