/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

rjs.music = {

    queue: [],

    playMusic: function (socket, packet) {
        if (rjs.config.verbose === true)
            socket.get('username', function (err, username) {
                console.log('%s played item no. %d', username, packet.item);
            });

        rjs.plugins['itunes'].playItem(packet.item);
    },

    // TODO - change volume using plugins
    changeVolume: function (socket, packet) {
        if (rjs.config.verbose) {
            socket.get('username', function (err, username) {
                if (err === null)
                    console.log('User %s changed volume. New value = %d', username, packet.value);
            });
        }

        // TODO
        rjs.plugins['itunes'].volume(packet.value);
    },

    play: function (socket) {
        if (rjs.config.verbose) {
            socket.get('username', function (err, username) {
                if (err === null)
                    console.log('User %s played the current song.', username);
            });
        }

        console.log(rjs.music.queue);

        if (rjs.music.queue.length > 0) {
            rjs.plugins[rjs.music.queue[0].id].play(function () {
                rjs.io.sockets.emit('played');
            });
        }
    },

    pause: function (socket) {
        if (rjs.config.verbose) {
            socket.get('username', function (err, username) {
                if (err === null)
                    console.log('User %s paused the current song.', username);
            });
        }

        if (rjs.music.queue.length > 0) {
            rjs.plugins[rjs.music.queue[0].id].pause(function () {
                rjs.io.sockets.emit('paused');
            });
        }
    },

};

module.exports = rjs.music;