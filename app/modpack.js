'use strict';

/**
 * Created by reiji-maigo on 30.12.2015.
 */
var github = require("./github"),
    fs = require("fs-extra"),
    config = require("./config.js").config,
    logger = require("./logger.js").getLogger(),
    email = require("./email.js"),

    /**
     *
     * @param branch
     */
    createModPackFromBranch = function (branch) {
        if (GLOBAL.runMode === "undefined") {
            logger.error("Run-Mode not set");
            process.exit(1);
        }

        logger.info("Run-Mode: '" + GLOBAL.runMode + "'");
        logger.info("Attempting to deploy Modpack for branch '" + branch + "'");

        var path = "tmp/" + GLOBAL.runMode + "/";

        if (fs.existsSync(path)) {
            logger.info("Repository available. Updating...");
            github.checkoutBranch(branch, path, createPack);
        } else {
            logger.info("Repository not available. Cloning...");
            github.cloneBranch(branch, path, createPack);
        }
    },

    /**
     *
     * @param tag
     */
    createModPackFromTag = function (tag) {
        if (GLOBAL.runMode === "undefined") {
            logger.error("Run-Mode not set");
            process.exit(1);
        }

        logger.info("Run-Mode: '" + GLOBAL.runMode + "'");
        logger.info("Attempting to deploy Modpack for tag '" + tag + "'");

        var path = "tmp/" + GLOBAL.runMode + "/";

        if (!fs.existsSync(path)) {
            logger.info("Repository not available. Cloning...");
            github.cloneBranch("master", path, createPack);
        }

        logger.info("Repository available. Updating...");
        github.checkoutTag(tag, path, createPack);
    },

    /**
     *
     * @param path
     * @param branchOrTag
     */
    createPack = function (path, branchOrTag) {
        var pack = config.packName + "-" + branchOrTag;

        logger.info("Packing everthing up.");

        // Removing old file if still there
        try {
            if (fs.statSync(config.paths.packages + pack).isDirectory()) {
                deleteFolderRecursive(config.paths.packages + pack + "/");
                logger.info("Removed existing pack '" + config.paths.packages + pack + "'");
            }
        } catch (e) {
            // do nothing
        }

        // Created folder for pack
        fs.mkdir(config.paths.packages + pack);
        logger.info("Created folder for pack '" + config.paths.packages + pack + "'");

        logger.info("Copy Files to release directory...");

        if (fs.statSync(config.paths.resourcepacks).isDirectory()) {
            fs.copy(
                config.paths.resourcepacks,
                config.paths.packages + pack + "/" + config.paths.resourcepacks,
                { preserveTimestamps: true }
            );
            logger.info("Added resource packs from '" + config.paths.resourcepacks + "'.");
        }

        ["bin", "mods", "config"].forEach(function (folder) {
            try {
                if (fs.statSync(path + folder).isDirectory()) {
                    fs.copy(
                        path + folder,
                        config.paths.packages + pack + "/" + folder,
                        { preserveTimestamps: true }
                    );
                    logger.info("Added '" + folder + "' from '" + path + "'.");
                }
            } catch (e) {
                if (e.code === "ENOENT") {
                    logger.warn("Folder '" + path + folder + "' not found! " + e);
                } else {
                    throw e;
                }
            }
        });

        logger.info("Put everything to '" + config.paths.packages + pack + "'.");

        // Send Mail
        //try {
        //    email.send("Pack build finished", "bla");
        //    logger.info("Email sent to '" + config.email.sendTo + "'");
        //} catch (e) {
        //    logger.error("Email sending failed: '" + e + "'");
        //}

    },

    /**
     *
     * @param path
     */
    deleteFolderRecursive = function(path) {
        var files = [];
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };;

exports.createModPackFromBranch = createModPackFromBranch;
exports.createModPackFromTag = createModPackFromTag;