/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

rjs.users = {

    connectedUsers: {},

    /* Set the username of a user, broadcast to everyone,
       and returns the user list */
    setUsername: function (socket, packet) {
        var users = [];
        var songs = [];
        var len   = rjs.plugins.length;

        rjs.users.connectedUsers[socket.id] = packet.username;
        socket.set('username', packet.username);

        socket.broadcast.emit('user connected', { username: packet.username });

        for (var key in rjs.users.connectedUsers) {
            users.push(rjs.users.connectedUsers[key]);
        }

        socket.emit('user list', { users: users });

        // socket.emit('itunes metadata', {
        //     'volume': rjs.itunes.volume
        // });

        // for (var i = 0; i < len; i++) {
        //     songs.push({
        //         library: rjs.plugins[i].songs(),
        //         plugin: rjs.plugins[i].id
        //     });
        // }
        // socket.emit('songs', songs);
    },

    /* Broadcast disconnection to everyone */
    setDisconnected: function (socket) {
        var username = rjs.users.connectedUsers[socket.id];

        rjs.io.sockets.emit('user disconnected', { username: username });
        delete rjs.users.connectedUsers[socket.id];
    },

    /* Emit when a new search has been executed */
    search: function (socket, packet) {
        var len = rjs.plugins.length;

        for (var i = 0; i < len; i++) {
            rjs.plugins[i].search(packet.pattern);
        }
    }

};

module.exports = rjs.user;