/*
 * RemoteJS
 * Control your music from your browser.
 *
 * Copyright (c) 2014 Jeffrey Muller
 * Licensed under the MIT license.
 */

var queries = {
    /* Reads response to get database */
    getDatabase: function (response) {
        if (response['daap.serverdatabases']['dmap.listing'] instanceof Array) {
            return response['daap.serverdatabases']['dmap.listing'][0]['dmap.listingitem']; // Need to fix that
        } else {
            return response['daap.serverdatabases']['dmap.listing']['dmap.listingitem'];
        }
    },

    /* Reads response to get containers */
    getContainer: function (response, containerName) {
        var containers = response['daap.databaseplaylists']['dmap.listing'];
        var len        = containers.length;

        for (var i = 0; i < len; i++) {
            if (containers[i]['dmap.listingitem']['dmap.itemname'] == containerName) {
                return containers[i]['dmap.listingitem'];
            }
        }
        return null;
    }
};

module.exports = queries;