/*
 * RemoteJS
 * Control your music from your browser.
 *
 * Copyright (c) 2014 Jeffrey Muller
 * Licensed under the MIT license.
 */

var fs      = require('fs'),
    crypto  = require('crypto'),
    queries = require('./queries.js');

var itunes = {
    /* Plugin ID */
    id: 'itunes',

    /* DAAP library */
    daap: require('daap'),

    /* Database id */
    databaseId: null,

    /* iTunes library */
    library: require('./library.js'),

    /* iTunes session */
    session: null,

    /* Config DAAP library */
    config: function (config) {
        itunes.daap.host        = config.host;
        itunes.daap.port        = config.port;
        itunes.daap.pairingCode = config.pairingCode;
        itunes.artworksPath     = config.artworks_path;
    },

    /* Load artworks for every song */
    artworks: function () {
        var len = itunes.library.songs.length;

        if (fs.existsSync(rjs.artworksPath) === false)
            fs.mkdirSync(rjs.artworksPath);

        itunes.library.songs.forEach(function(song, idx) {
            itunes.daap.artwork(itunes.session, itunes.databaseId, song.itemId, function(error, data) {
                if (data.length) { // Has cover
                    var md5 = crypto.createHash('md5').update(data).digest('hex');

                    itunes.library.songs[idx].hasArtwork = rjs.artworksPath + md5 + '.png';

                    if (fs.existsSync(rjs.artworksPath + md5 + '.png') === false)
                        fs.writeFileSync(rjs.artworksPath + md5 + '.png', data);
                }
            });
        });
    },

    /* Load iTunes library in RemoteJS */
    loadLibrary: function () {
        itunes.daap.login(function (error, data) {
            if (error === null) {
                itunes.session = data['dmap.loginresponse']['dmap.sessionid'];

                itunes.daap.databases(itunes.session, function (error, data) {
                    var database = queries.getDatabase(data);
                    itunes.databaseId = database['dmap.itemid'];

                    itunes.daap.containers(itunes.session, database['dmap.itemid'], function (error, data) {
                        var container = queries.getContainer(data, 'Musique');

                        rjs.libdaap.items(itunes.session, database['dmap.itemid'], container['dmap.itemid'], function (error, data) {
                            var songs = data['daap.playlistsongs']['dmap.listing'];
                            var len = songs.length;

                            for (var i = 0; i < len; i++) {
                                itunes.library.addSong(songs[i]['dmap.listingitem']);
                            }

                            itunes.artworks();
                        });
                    });
                });
            }
        });
    },

    /* Get songs */
    songs: function () {
        return {
            'artists': itunes.library.artists,
            'albums': itunes.library.albums,
            'songs': itunes.library.songs
        };
    },

    /* Play a song */
    play: function (item) {
        itunes.daap.play(itunes.session, item, function(error, data) {
            if (error) {
                // TODO: log error
            }
        });
    }
};

module.exports = function (config) {
    itunes.config(config);
    itunes.loadLibrary();

    return itunes;
};