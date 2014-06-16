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

                        itunes.daap.items(itunes.session, database['dmap.itemid'], container['dmap.itemid'], function (error, data) {
                            var songs = data['daap.playlistsongs']['dmap.listing'];
                            var len = songs.length;

                            for (var i = 0; i < len; i++) {
                                itunes.library.addSong(songs[i]['dmap.listingitem']);
                            }

                            itunes.artworks();
                            itunes.currentSong(function (song) {
                                if (rjs.config.verbose === true)
                                    console.log('Current song in iTunes : %s', JSON.stringify(song));

                                if (song !== null)
                                    rjs.music.queue.push(song);
                            });
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

    /* Get the current playing song */
    currentSong: function (callback) {
        itunes.daap.playStatusUpdate(itunes.session, function (error, data) {
            var song = null;

            if (error !== null && rjs.config.verbose === true)
                console.log('Unable to get the current song. [ERROR: %s]', error);

            song = {
                'playing': (data['dmcp.playstatus']['dacp.playerstate'] === 4) ? true : false,
                'title': data['dmcp.playstatus']['dacp.nowplayingname'],
                'artist': data['dmcp.playstatus']['dacp.nowplayingartist'],
                'album': data['dmcp.playstatus']['dacp.nowplayingalbum'],
                'id': itunes.id
            };

            callback(song);
        });
    },

    /* Play a song */
    playItem: function (item) {
        itunes.daap.play(itunes.session, item, function(error, data) {
            if (error) {
                // TODO: log error
            }
        });
    },

    /* Set/Get volume on iTunes */
    volume: function (value, callback) {
        if (value != null) {
            itunes.daap.setProperty(itunes.session, {
                'dmcp.volume': value
            }, function(error, data) {
                console.log(error);
                console.log(data);
                if (error && rjs.config.verbose === true) {
                    console.log('Error when trying to change volume');
                }
            });
        }

        if (callback != null && typeof callback === 'function')
            itunes.daap.getProperty(itunes.session, ['dmcp.volume', 'dmcp.playstatus'], callback);
    },

    /* Pause the current song */
    pause: function (onSuccess) {
        itunes.daap.pause(itunes.session, function(error, data) {
            if (error !== null && rjs.config.verbose === true)
                console.log('iTunes doesn\'t seem to want to pause music...')

            onSuccess();
        });
    },

    /* Play the current song */
    play: function (onSuccess) {
        itunes.daap.playPause(itunes.session, function(error, data) {
            if (error !== null && rjs.config.verbose === true)
                console.log('iTunes doesn\'t seem to want to play music...')

            onSuccess();
        });
    },

    /* Send player data (such as song title, artist name, player is running, ...) */
    playerData: function (socket) {
        var playerData = {};

        itunes.volume(null, function (error, data) {
            if (error) {
                if (rjs.config.verbose === true) console.log('Failed to get volume');
                return;
            }

            playerData.volume = data['dmcp.getpropertyresponse']['dmcp.volume'];
            itunes.daap.playStatusUpdate(itunes.session, function (error, data) {
                if (error) {
                    if (rjs.config.verbose === true) console.log('Failed to get playStatusUpdate');
                    return;
                }

                playerData.playing = (data['dmcp.playstatus']['dacp.playerstate'] == 4) ? true : false;
                playerData.current_song = data['dmcp.playstatus']['dacp.nowplayingname'];
                playerData.current_artist = data['dmcp.playstatus']['dacp.nowplayingartist'];
                playerData.current_album = data['dmcp.playstatus']['dacp.nowplayingalbum'];

                socket.emit('player data', playerData);
            });
        });
    }
};

module.exports = function (config) {
    itunes.config(config);
    itunes.loadLibrary();

    return itunes;
};