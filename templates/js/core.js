/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

app        = {};
app.users  = {};
app.ui     = {};

app.socket          = null;
app.panelOpened     = null;

/***** EXTEND LIBRARIES *****/
Array.prototype.inArray = function(p_val) {
    return (this.indexOf(p_val) != -1);
}

app.proxyClickEvent = function(event) {
    var role = $(event.currentTarget).attr('role');

    if (role == 'open-panel' || app.panelOpened !== null) {
        app.togglePanel(event);
    } else if (role == 'user-login') {
        app.users.login($('input[name=login]').val());
    } else if (role == 'play-song') {
        app.users.playSong(event);
    } else if (role == 'navigation') {
        app.ui.navigation(event);
    }

    return false;
};

app.togglePanel = function(event) {
    var panel          = $(event.currentTarget).attr('href');
    var bodyAnimation  = {};
    var panelAnimation = {};

    if (app.panelOpened === null) {
        bodyAnimation[$(panel).hasClass('panel-right') ? 'right' : 'left'] = '260px';
        panelAnimation[$(panel).hasClass('panel-right') ? 'right' : 'left'] = '0px';

        app.panelOpened = $(panel);

        $('body').css('position', 'absolute').animate(bodyAnimation);
        $(panel).css('display', 'block').animate(panelAnimation);
    } else {
        bodyAnimation[$(app.panelOpened).hasClass('panel-right') ? 'right' : 'left'] = '0px';
        panelAnimation[$(app.panelOpened).hasClass('panel-right') ? 'right' : 'left'] = '-260px';

        $('body').animate(bodyAnimation);
        $(app.panelOpened).animate(panelAnimation);

        app.panelOpened = null;
    }

    return false;
};

$(function() {
    
    var username = null;
    app.socket   = io.connect('http://' + ipAddress);

    $('a, input[type=submit]').click(app.proxyClickEvent);

    setTimeout(function() {
        username = localStorage.getItem('username');
        if (username == null) {
            setTimeout(function() {
                $('.box').show();
            }, 100);        
        } else {
            app.users.login(username);
        }
    }, 100);

});