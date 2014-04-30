/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

rjs.music = {

    playMusic: function (socket, packet) {
        if (rjs.config.verbose === true)
            socket.get('username', function (err, username) {
                console.log('%s played item no. %d', username, packet.item);
            });

        rjs.plugins[0].play(packet.item);
    },

    changeVolume: function (socket, packet) {
        rjs.libdaap.setProperty(rjs.itunes.session, {
            'dmcp.volume': packet.value
        }, function(error, data) {
            if (error) {
                // TODO: log error
            }
        });

        rjs.itunes.volume = packet.value;

        /* Broadcast to other users */
        socket.broadcast.emit('volume', { value: packet.value });
    }

};

module.exports = rjs.music;