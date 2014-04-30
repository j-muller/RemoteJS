/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

var fs     = require('fs'),
    crypto = require('crypto');

rjs.itunes = {

    /* Store iTunes session id */
    session: null,

    /* Store iTunes database id */
    databaseId: null,

    /* Volume value in iTunes */
    volume: null,

    /* Get iTunes session id */
    login: function (callback) {
        rjs.libdaap.login(function (error, data) {
            if (error === null) {
                rjs.itunes.session = data['dmap.loginresponse']['dmap.sessionid'];

                if (typeof callback === 'function')
                    callback(rjs.itunes.session);
            }
        });
    },

    getDatabase: function (response) {
        return response['daap.serverdatabases']['dmap.listing']['dmap.listingitem'];
    },

    getContainer: function (response, containerName) {
        var containers = response['daap.databaseplaylists']['dmap.listing'];
        var len = containers.length;

        for (var i = 0; i < len; i++) {
            if (containers[i]['dmap.listingitem']['dmap.itemname'] == containerName) {
                return containers[i]['dmap.listingitem'];
            }
        }
        return null;
    },

    getSongs: function (response) {
        var songs = response['daap.playlistsongs']['dmap.listing'];
        var len = songs.length;

        for (var i = 0; i < len; i++) {
            rjs.library.addSong(songs[i]['dmap.listingitem']);
        }
    },

    getProperties: function() {
        rjs.libdaap.getProperty(rjs.itunes.session, [
            'dmcp.volume'
        ], function (error, data) {
            if (error == null && data['dmcp.getpropertyresponse']['dmap.status'] === 200) {
                rjs.itunes.volume = data['dmcp.getpropertyresponse']['dmcp.volume'];
            }
        });
    },

    getArtworks: function() {
        var len = rjs.library.songs.length;

        // TODO: Configuration file
        if (fs.existsSync('./artworks/') === false) {
            fs.mkdirSync('./artworks/');
        }

        rjs.library.songs.forEach(function(song, idx) {
            rjs.libdaap.artwork(rjs.itunes.session, rjs.itunes.database, song.itemId, function(error, data) {
                if (data.length) { // Has cover
                    var md5 = crypto.createHash('md5').update(data).digest('hex');

                    rjs.library.songs[idx].hasArtwork = md5;

                    if (fs.existsSync('./artworks/' + md5 + '.png') === false)
                        fs.writeFileSync('./artworks/' + md5 + '.png', data);
                }
            });
        });
    },

    /* */
    updateItems: function () {
        rjs.itunes.getProperties();

        rjs.libdaap.databases(rjs.itunes.session, function (error, data) {

            if (error == null && data['daap.serverdatabases']['dmap.status'] === 200) {
                rjs.itunes.database = rjs.itunes.getDatabase(data)['dmap.itemid'];

                rjs.libdaap.containers(rjs.itunes.session, rjs.itunes.database, function (error, data) {
                    if (error == null && data['daap.databaseplaylists']['dmap.status'] === 200) {
                        var container = rjs.itunes.getContainer(data, 'Musique')['dmap.itemid'];

                        rjs.libdaap.items(rjs.itunes.session, rjs.itunes.database, container, function (error, data) {
                            if (error == null && data['daap.playlistsongs']['dmap.status'] === 200) {
                                rjs.itunes.getSongs(data);

                                rjs.itunes.getArtworks();

                                rjs.libdaap.foo(rjs.itunes.session, function (error, data) {
                                    console.log(data);
                                });
                            }
                        });
                    }
                });
            }
        });
    }

};

module.exports = rjs.itunes;