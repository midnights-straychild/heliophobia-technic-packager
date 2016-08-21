'use strict';

/**
 * Created by reiji-maigo on 30.12.2015.
 */
var github = require("./github"),
    fs = require("fs-extra"),
    archiver = require("archiver"),
    config = require("./config.js").config,
    logger = require("./logger.js").getLogger(),
    email = require("./email.js"),
    path = require('path'),

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

        if (fs.existsSync(path)) {
            logger.info("Repository available. Updating...");
            github.checkoutTag(tag, path, createPack);
        } else {
            logger.info("Repository not available. Cloning...");
            github.cloneBranch("master", path, createPack);
        }
    },

    /**
     *
     * @param path
     * @param branch
     * @param tag
     */
    createPack = function (path, branch, tag) {
        var pack = config.packName + "-" + branch,
            packWorkingPath = config.paths.packages + pack,
            packFilePath = config.paths.packages + pack + ".zip";

        if(tag !== undefined) {
            packWorkingPath = config.paths.packages + config.packName + "-" + tag;
        }

        logger.info("Packing everthing up.");

        // Remove old working folder pack
        try {
            if (fs.statSync(packWorkingPath).isDirectory()) {
                deleteFolderRecursiveSync(packWorkingPath);
                logger.info("Removed working folder pack '" + packWorkingPath + "'");
            }
        } catch (e) {
            logger.error("nothing deleted. " + e);
        }

        // Created folder for pack
        if (!fs.existsSync(packWorkingPath)) {
            fs.mkdirSync(packWorkingPath);
        }
        logger.info("Created folder for pack '" + packWorkingPath + "'");

        // Copy Files to release directory
        logger.info("Copy Files to release directory...");
        // Copy ressourcepack to release directory
        if (fs.statSync(config.paths.resourcepacks).isDirectory()) {
            fs.copySync(
                config.paths.resourcepacks,
                packWorkingPath + "/" + config.paths.resourcepacks,
                {preserveTimestamps: true}
            );
            logger.info("Added resource packs from '" + config.paths.resourcepacks + "'.");
        }

        // Copy repo files to release directory
        try {
            if (fs.statSync(path).isDirectory()) {
                fs.copySync(
                    path,
                    packWorkingPath + "/",
                    {preserveTimestamps: true}
                );
                logger.info("Added '" + path + "'");
            }
        } catch (e) {
            if (e.code === "ENOENT") {
                logger.warn("Folder '" + path + "' not found! " + e);
            } else {
                throw e;
            }
        }

        logger.info("Put everything to '" + packWorkingPath + "'.");

        // Remove old pack file
        try {
            if (fs.statSync(packFilePath).isFile()) {
                fs.unlink(packFilePath);
                logger.info("Removed old pack file '" + packFilePath + "'");
            }
        } catch (e) {
            // do nothing
        }

        // Zip working directory
        logger.info("Starting to compress working directory '" + packFilePath + "'...");

        try {
            compressWorkingDirectory(packWorkingPath, packFilePath);
        } catch (e) {
            logger.error(e);
        }


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
    deleteFolderRecursiveSync = function (path) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursiveSync(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },

    /**
     *
     * @param packWorkingPath
     * @param packFilePath
     */
    compressWorkingDirectory = function (packWorkingPath, packFilePath) {
        var output = fs.createWriteStream(packFilePath),
            archive = archiver('zip');

        output.on('close', function () {
            logger.info(archive.pointer() + ' total bytes');
            logger.info('archiver has been finalized and the output file descriptor has closed.');
        });

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(output);

        archive.bulk([
            {expand: true, cwd: packWorkingPath, src: ['**/*']}
        ]);

        archive.finalize();
    },

    /**
     *
     * @param srcpath
     * @returns {Array.<T>|*}
     */
    getDirectories = function (srcpath) {
        return fs.readdirSync(srcpath).filter(function(file) {
            return fs.statSync(path.join(srcpath, file)).isDirectory();
        });
    };


exports.createModPackFromBranch = createModPackFromBranch;
exports.createModPackFromTag = createModPackFromTag;