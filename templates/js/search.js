/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

app.search = {

    onKeyPressed: function(event) {
        if (event.keyCode == 13) { // Enter key
            var pattern = $('input[name=search]').val().trim();

            if (pattern.length > 0) {
                app.ui.loading(function() {
                    app.socket.emit('search', { pattern: pattern });

                    // setTimeout(function() {
                    //     $.unblockUI();
                    // }, 1000);
            });
            }
        }
    },

};

setTimeout(function() {

    $('input[name=search]').keyup(app.search.onKeyPressed);

}, 100);