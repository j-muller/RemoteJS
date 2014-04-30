/*
 * remotejs
 * Controls iTunes from your browser
 *
 * Copyright (c) 2013 Jeffrey Muller
 * Licensed under the MIT license.
 */

rjs.utils = {

    eventProxy: function (event, socket, callback) {
        socket.on(event, function(packet) {
            if (typeof callback === "function") {
                callback(socket, packet);
            }
        });
    },

    trim: function (s) {
        return s.replace(/^\s+|\s+$/g, '');
    },

    getLocalIpAddress: function (chosenDev) {
        var interfaces = require('os').networkInterfaces();

        for (var dev in interfaces) {
            if (chosenDev == dev) {
                for (var i = 0; i < interfaces[dev].length; i++) {
                    if (interfaces[dev][i].family == 'IPv4') {
                        return interfaces[dev][i].address;
                    }                    
                }
            }
        }
        return null;
    }

};

module.exports = rjs.utils;