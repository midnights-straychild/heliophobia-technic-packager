/**
 * Created by reiji-maigo on 30.12.2015.
 */
var modpack = require('./app/modpack.js'),
    http = require('http'),
    logger = require("./app/logger.js").getLogger(),
    createHandler = require('github-webhook-handler'),
    handler = createHandler({path: '/build', secret: '34t809ut9ugfd$'});

GLOBAL.runMode = "deamon";

http.createServer(function (req, res) {
    handler(req, res, function (err) {
        res.statusCode = 404;
        res.end('no such location');
    })
}).listen(25570);

handler.on('error', function (err) {
    logger.error('Error:', err.message);
});

handler.on('push', function (event) {
    logger.info('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
});

handler.on('release', function (event) {
    logger.info('Received an release event for %s action=%s',
        event.payload.repository.name,
        event.payload.action);

    modpack.createModPackFromTag(event.payload.tag_name);
});