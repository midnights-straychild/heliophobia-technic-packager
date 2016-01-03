'use strict';

/**
 * Created by reiji-maigo on 30.12.2015.
 */
var github = require("./github"),
    fs = require("fs"),
    config = require("./config.js").config,
    logger = require("./logger.js").getLogger(),
    email = require("./email.js"),
    Zip = require("./zip.js"),

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
            github.checkoutBranch(branch, path, createZip);
        } else {
            logger.info("Repository not available. Cloning...");
            github.cloneBranch(branch, path, createZip);
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
            github.cloneBranch("master", path, createZip);
        }

        logger.info("Repository available. Updating...");
        github.checkoutTag(tag, path, createZip);
    },

    /**
     *
     * @param path
     * @param branchOrTag
     */
    createZip = function (path, branchOrTag) {
        var zip = new Zip(),
            targetFile = config.packName + "-" + branchOrTag + ".zip";

        logger.info("Packing everthing up.");

        // Add folder from Repo
        if (fs.statSync(path).isDirectory()) {
            ["bin", "mods", "config"].forEach(function (folder) {
                try {
                    if (fs.statSync(path + folder).isDirectory()) {
                        zip.addLocalFolder(path + folder, folder);
                        logger.info("Added '" + folder + "' from '" + path + "'.");
                    }
                } catch (e) {
                    if(e.code === "ENOENT") {
                        logger.warn("Folder '" + path + folder + "' not found! " + e);
                    } else {
                        throw e;
                    }
                }
            });
        }

        // Add Ressource Packs
        //if (fs.statSync(config.paths.resourcepacks).isDirectory()) {
        //    zip.addLocalFolder(config.paths.resourcepacks, config.paths.resourcepacks);
        //    logger.info("Added resource packs from '" + config.paths.resourcepacks + "'.");
        //}

        // Removing old file if still there
        try {
            if (fs.statSync(config.paths.packages + targetFile).isFile()) {
                fs.unlinkSync(config.paths.packages + targetFile);
                logger.info("Removed existing pack '" + config.paths.packages + targetFile + "'");
            }
        } catch (e) {
            // do nothing
        }

        // Compress to File
        if (fs.statSync(config.paths.packages).isDirectory()) {
            logger.info("Compressing...");

            zip.compressAndWriteZip(config.paths.packages + targetFile);

            logger.info("Put everything to '" + config.paths.packages + targetFile + "'.");
        }

        // Send Mail
        //try {
        //    email.send("Pack build finished", "bla");
        //    logger.info("Email sent to '" + config.email.sendTo + "'");
        //} catch (e) {
        //    logger.error("Email sending failed: '" + e + "'");
        //}

    };

exports.createModPackFromBranch = createModPackFromBranch;
exports.createModPackFromTag = createModPackFromTag;