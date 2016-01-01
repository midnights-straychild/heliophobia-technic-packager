/**
 * Created by reiji-maigo on 30.12.2015.
 */
var http = require('http'),
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
    console.error('Error:', err.message);
});

handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
});

handler.on('release', function (event) {
    console.log('Received an issue event for %s action=%s: #%d %s',
        event.payload.repository.name,
        event.payload.action,
        event.payload.issue.number,
        event.payload.issue.title);
});