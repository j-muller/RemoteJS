/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

app.music = {

    songMetadata: function(song) {
        return {
            'song': song,
            'artist': (song.artist !== null) ? app.library.artists[song.artist] : null,
            'album': (song.album !== null) ? app.library.albums[song.album] : null
        };
    },

    artistMetadata: function(artist) {
        var songs  = [];
        var albums = [];

        for (var i = 0; i < artist.songs.length; i++) {
            songs.push(app.library.songs[artist.songs[i]]);
        }

        for (var i = 0; i < artist.albums.length; i++) {
            albums.push(app.library.albums[artist.albums[i]]);
        }

        return {
            'artist': artist,
            'songs': songs,
            'albums': albums
        };
    },

    onVolumeSliderChanged: function(event) {
        var sliderValue = $(event.currentTarget).val();

        app.socket.emit('change volume', { value: sliderValue });
    },

    renderItunesMetadata: function(data) {
        $('input[name=volume-slider]').val(data.volume);
    }

};

setTimeout(function() {

    app.socket.on('volume', function(packet) {
        $('input[name=volume-slider]').val(packet.value).slider('refresh');
    });

    app.socket.on('itunes metadata', function (packet) {
        app.music.renderItunesMetadata(packet);
    });

    $('input[name=volume-slider]').mouseup(app.music.onVolumeSliderChanged);

}, 100);