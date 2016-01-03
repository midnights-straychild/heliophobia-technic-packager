'use strict';

/**
 * Created by reiji-maigo on 31.12.2015.
 */
var config = require("./config.js").config,
    winston = require("winston"),
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({filename: config.paths.logs + 'main.log'})
        ]
    }),

    /**
     *
     * @returns winston.Logger
     */
    getLogger = function () {
        return logger;
    };

exports.getLogger = getLogger;
