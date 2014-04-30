/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

app.ui = {

    /****** Front-end templates *******/

    songTemplate: function(song) {
        var song = app.music.songMetadata(song);
        var artwork = (song.song.hasArtwork) ? song.song.hasArtwork : 'images/no-cover.png';
        var template = $('<a>').attr('href', '#').attr('data-itemid', song.song.itemId)
                               .attr('role', 'play-song');

        template.append($('<img>').attr('class', 'cover').attr('src', artwork));
        template.append($('<p>').attr('class', 'timer').text(app.ui.renderLength(song.song.length)));
        template.append(
            $('<div>').attr('class', 'content').append(
                $('<span>').append(
                    $('<p>').attr('class', 'title').text(song.song.title)
                ).append(
                    $('<p>').attr('class', 'subtitle').text(song.album.title).append(
                        $('<span>').attr('class', 'artist').text(song.artist.name)
                    )
                )
            )
        );

        return {
            'template': $('<li>').attr('class', 'item').append(template),
            'filter': song.song.title
        };
    },

    albumTemplate: function(album) {
        var artwork = (app.library.songs[album.songs[0]].hasArtwork) ?
                        'artworks/' + app.library.songs[album.songs[0]].hasArtwork + '.png' : 'images/no-cover.png';
        var template = $('<a>').attr('href', '#album').attr('data-title', album.title)
                               .attr('role', 'navigation');

        template.append($('<img>').attr('class', 'cover').attr('src', artwork));
        template.append(
            $('<div>').attr('class', 'content').append(
                $('<span>').append(
                    $('<p>').attr('class', 'title').text(album.title)
                ).append(
                    $('<p>').attr('class', 'subtitle').text(app.library.artists[album.artist].name).append(
                        $('<span>').attr('class', 'artist').text(album.songs.length + ' songs')
                    )
                )
            )
        );

        return {
            'template': $('<li>').attr('class', 'item').append(template),
            'filter': album.title
        };
    },

    artistTemplate: function(artist) {
        artist = app.music.artistMetadata(artist);
        var artwork = (artist.songs.length > 0 && artist.songs[0].hasArtwork) ?
                        'artworks/' + artist.songs[0].hasArtwork + '.png' : 'images/no-cover.png';
        var template = $('<a>').attr('href', '#artist').attr('data-artist', artist.artist.name)
                               .attr('role', 'navigation');

        template.append($('<img>').attr('class', 'cover').attr('src', artwork));
        template.append(
            $('<div>').attr('class', 'content').append(
                $('<span>').append(
                    $('<p>').attr('class', 'title').text(artist.artist.name)
                ).append(
                    $('<p>').attr('class', 'subtitle').text(artist.albums.length + ' album').append(
                        $('<span>').attr('class', 'artist').text(artist.songs.length + ' songs')
                    )
                )
            )
        );

        return {
            'template': $('<li>').attr('class', 'item').append(template),
            'filter': artist.artist.name
        };
    },

    /****** End Front=end templates *******/

    albumDetails: function(albumTitle) {
        var len   = app.library.albums.length;
        var album = null;

        for (var i = 0; i < len; i++) {
            album = app.library.albums[i];

            if (album.title.toLowerCase() == albumTitle.toLowerCase())
                break;
        }

        if (album !== null) {
            var songs = [];
            var entireLength = 0;

            len = album.songs.length;
            for (var i = 0; i < len; i++) {
                entireLength += app.library.songs[album.songs[i]].length;

                songs.push(app.library.songs[album.songs[i]]);
            }

            var artwork = (songs[0].hasArtwork === true) ? 'artworks/' + songs[0].itemId + '.png' : 'images/no-cover.png';
            var header = $('<li>').attr('class', 'album-header')

            header.append($('<img>').attr('class', 'cover').attr('src',  artwork));
            header.append(
                $('<div>').attr('class', 'content').append(
                    $('<span>').append(
                        $('<p>').attr('class', 'title').text(albumTitle)
                    ).append(
                        $('<p>').attr('class', 'subtitle').text(songs.length + ' songs, ').append(
                            $('<span>').attr('class', 'artist').text(app.ui.renderLength(entireLength, true))
                        )
                    )
                )
            );

            $('.items-list').append(header);
            app.ui.buildTemplate(songs, app.ui.songTemplate, false);
        }
    },

    artistDetails: function(artistName) {
        var len = app.library.artists.length;

        for (var i = 0; i < len; i++) {
            var artist = app.library.artists[i];

            if (artist.name.toLowerCase() == artistName.toLowerCase()) {
                len = artist.albums.length;

                for (var i = 0; i < len; i++) {
                    app.ui.albumDetails(app.library.albums[artist.albums[i]].title);
                }

                break;
            }
        }
    },

    renderLength: function(length, lettersDisplay) {
        var minuts = parseInt(length / 1000 / 60);
        var seconds = parseInt(length / 1000 % 60);

        if (lettersDisplay !== null && lettersDisplay === true) {
            return minuts + ' min and ' + ('0' + seconds).slice(-2) + ' sec';
        } else {
            return minuts + ':' + ('0' + seconds).slice(-2);
        }
    },

    loading: function(onLoad) {
        $.blockUI({
            message: 'Loading, please wait...',
            css: {
                padding: 10,
            },
            onBlock: onLoad
        });
    },

    sanitizeFirstLetter: function(song_name) {
        var replacements = [
            {'pattern': ['$'], 'replace': 'S'},
            {'pattern': ['\'', '('], 'replace': ''},
        ];
        var len = replacements.length;

        for (var i = 0; i < len; i++) {
            if (replacements[i].pattern.inArray(song_name[0])) {
                song_name = replacements[i].replace + song_name.substring(1);
            }
        }

        return song_name;
    },

    addSorted: function(template, comparison) {
        var added = false;

        $('.items-list li[class=divider]').each(function() {
            if ($(this).text() > comparison) {
                $(template).insertBefore($(this));
                added = true;
                return false;
            }
        });

        if (added === false)
            $('.items-list').append(template);
    },

    renderTemplate: function(template, sort_value, sort) {
        sort_value = app.ui.sanitizeFirstLetter(sort_value);
        var category = $('.items-list li[data-startswith=' + sort_value[0] + ']');

        if (sort !== null && sort === false) {
            $('.items-list').append(template);
        } else {
            if (category.length == 0) {
                var divider = $('<li>').attr('class', 'divider')
                                       .attr('data-startswith', sort_value[0])
                                       .text(sort_value[0]);

                this.addSorted(divider, $(divider).text());
                $(template).insertAfter(divider);
            } else {
                this.addSorted(template, sort_value[0]);
            }
        }
    },

    buildTemplate: function(items, funcTemplate, sort) {
        var len = items.length;

        for (var i = 0; i < len; i++) {
            var result = funcTemplate(items[i]);

            app.ui.renderTemplate(result.template, result.filter, sort);
        }

        var listContentWidth = $(document).width() - (parseInt($('.items-list li.item').css('margin-left')) * 2
                                + 100 + $('.items-list li .timer').width()); // TODO: Fix cover width

        $('.items-list li .title, .items-list li .subtitle').css('max-width', listContentWidth);
        $('.items-list a').click(app.proxyClickEvent);
    },

    changeItemMenu: function(changeTo) {
        $('ul.navigation a[class=active]').removeClass('active');
        $('ul.navigation a[href=' + changeTo + ']').addClass('active');
    },

    navigation: function(event) {
        var changeTo = $(event.currentTarget).attr('href');
        var self = this;

        app.ui.loading(function() {

            if (changeTo !== '#album' && changeTo !== '#artist') // Go to a subsection, no need to change
                self.changeItemMenu(changeTo);
            
            $('.items-list').empty();

            if (changeTo == '#songs') {
                app.ui.buildTemplate(app.library.songs, app.ui.songTemplate);
            } else if (changeTo == '#albums') {
                app.ui.buildTemplate(app.library.albums, app.ui.albumTemplate);
            } else if (changeTo == '#artists') {
                app.ui.buildTemplate(app.library.artists, app.ui.artistTemplate);
            } else if (changeTo == '#album') {
                app.ui.albumDetails($(event.currentTarget).data('title'));
            } else if (changeTo == '#artist') {
                app.ui.artistDetails($(event.currentTarget).data('artist'));
            }

            $('html, body').animate({
                scrollTop: 0
            }, 'slow');
            $.unblockUI();
        });
    }

};