/**
 * Created by reiji-maigo on 30.12.2015.
 */
var github = require("./github"),
    fs = require("fs"),
    config = require("./config.js").config,
    logger = require("./logger.js").getLogger(),

    createModPackFromBranch = function (branch) {
        if(GLOBAL.runMode === "undefined") {
            logger.error("Run-Mode not set");
            process.exit(1);
        }

        logger.info("Run-Mode: '" + GLOBAL.runMode + "'");
        logger.info("Attempting to deploy Modpack for branch '" + branch + "'");

        var path = config.paths.tmp + GLOBAL.runMode + "/";

        if(fs.existsSync(path)) {
            logger.info("Repository available. Updating...");
            github.updateBranch(branch, path);
        } else {
            logger.info("Repository not available. Cloning...");
            github.cloneBranch(branch, path);
        }
    },
    createModPackFromTag = function (tag) {
        if(GLOBAL.runMode === "undefined") {
            logger.error("Run-Mode not set");
            process.exit(1);
        }

        logger.info("Run-Mode: '" + GLOBAL.runMode + "'");
        logger.info("Attempting to deploy Modpack for tag '" + tag + "'");

        var path = config.paths.tmp + GLOBAL.runMode + "/";

        if(fs.existsSync(path)) {
            logger.info("Repository available. Updating...");
            github.updateTag(tag, path);
        } else {
            logger.info("Repository not available. Cloning...");
            github.cloneTag(tag, path);
        }
    },

    handleAssets = function(path) {

    };

exports.createModPackFromBranch = createModPackFromBranch;
exports.createModPackFromTag = createModPackFromTag;