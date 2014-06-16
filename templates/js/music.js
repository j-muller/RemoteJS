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

    renderPlayerData: function(data) {
        if (data.playing === true)
            $('.play-pause').removeClass('fa-play').addClass('fa-pause');
        else
            $('.play-pause').removeClass('fa-pause').addClass('fa-play');

        $('.song-data h1').text(data.current_song);
        $('.song-data h3').text(data.current_artist);
        $('input[type=range].volume').val(data.volume);
    },

    togglePlay: function() {
        if ($('.play-pause').hasClass('fa-play'))
            app.socket.emit('play');
        else
            app.socket.emit('pause');
    }

};

setTimeout(function() {

    app.socket.on('paused', function () {
        $('.play-pause').removeClass('fa-pause').addClass('fa-play');
    });

    app.socket.on('played', function () {
        $('.play-pause').removeClass('fa-play').addClass('fa-pause');
    });

    app.socket.on('volume', function(packet) {
        $('input[type=range].volume').val(packet.value);
    });

    app.socket.on('player data', function (packet) {
        app.music.renderPlayerData(packet);
    });

    $('.play-pause').click(app.music.togglePlay);
    $('input[type=range].volume').on('click touchend', app.music.onVolumeSliderChanged);

}, 100);