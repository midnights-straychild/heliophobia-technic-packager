/**
 * Created by reiji-maigo on 01.01.2016.
 */
var email = require("emailjs/email"),
    logger = require("./logger.js").getLogger(),
    config = require("./config.js").config,
    server = email.server.connect({
        user: config.email.server.user,
        password: config.email.server.password,
        host: config.email.server.host,
        ssl: false,
        tls: true,
        authentication: email.SMTP.authentication.LOGIN
    }),
    send = function(subject, text) {
        server.send({
            from:    config.email.sendFrom,
            to:      config.email.sendTo,
            subject: subject,
            text:    text
        }, function(err, message) { logger.error(err || message); });
    };

exports.send = send;
