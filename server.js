/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

rjs = {}; // Global settings object

var express = require('express'),
    swig    = require('swig'),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server, { log: false }),
    config  = require('yaml-config'),
    users   = require('./modules/users.js'),
    library = require('./modules/library.js'),
    itunes  = require('./modules/itunes.js'),
    music   = require('./modules/music.js'),
    utils   = require('./utils.js');

rjs.io           = io;
rjs.config       = config.readConfig('./config.yaml');
rjs.plugins      = {};
rjs.artworksPath = rjs.config.artworks_path;

/*********** ROUTES ***********/
app.get('/', function (request, response) {
    response.render('index');
});

/*********** CONFIG ***********/
// app.use(express.logger());
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/templates');

app.use('/artworks/', express.static(rjs.artworksPath));
app.use(express.static(__dirname + '/templates/'));

swig.setDefaults({
    cache: false,
    locals: {
        ipAddress: rjs.utils.getLocalIpAddress(rjs.config.network_interface)
    }
});

/*********** PLUGIN MANAGER ************/
for (var plugin in rjs.config.plugins) {
    var pluginConf = rjs.config.plugins[plugin];
    var plugin     = require(pluginConf.path)(pluginConf);

    rjs.plugins[plugin.id] = plugin;
}

/*********** SOCKET.IO ***********/
io.sockets.on('connection', function (socket) {

    /* Users */
    utils.eventProxy('set username', socket, rjs.users.setUsername);
    utils.eventProxy('disconnect', socket, rjs.users.setDisconnected);
    utils.eventProxy('search', socket, rjs.users.search);

    /* Music */
    utils.eventProxy('play music', socket, rjs.music.playMusic);
    utils.eventProxy('change volume', socket, rjs.music.changeVolume);
    utils.eventProxy('pause', socket, rjs.music.pause);
    utils.eventProxy('play', socket, rjs.music.play);

});


server.listen(12340);