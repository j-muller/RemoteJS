/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

app.users = {

    login: function(username) {
        if (username.length >= 4) {
            localStorage.setItem('username', username);

            $('.box').hide();

            app.socket.emit('set username', { username: username });
        }
    },

    playSong: function (event) {
        var itemId = $(event.currentTarget).attr('data-itemid');

        app.socket.emit('play music', { item: itemId });
        return false;
    },

    deleteUser: function (user) {
        $('.users li').each(function (idx, e) {
            if (user == $.trim($(e).text()))
                $(e).remove();
        });
    },

    renderUsers: function (users) {
        var len = users.length;

        for (var i = 0; i < len; i++) {
            var template = $('<li>').text(users[i]);

            $('.users').append(template);
        }
    },

};

setTimeout(function() {

    app.socket.on('user connected', function (packet) {
        app.users.renderUsers([packet.username]);
    });

    app.socket.on('user list', function (packet) {
        app.users.renderUsers(packet.users);
    });

    app.socket.on('user disconnected', function (packet) {
        app.users.deleteUser(packet.username);
    });

    app.socket.on('songs', function (packet) {
        app.library = packet[0].library; // TODO

        app.ui.loading(function() {
            app.ui.buildTemplate(app.library.songs, app.ui.songTemplate);

            $.unblockUI();
        });
    });

}, 100);