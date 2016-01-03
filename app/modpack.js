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
        var pack = config.packName + "-" + branchOrTag,
            packWorkingPath = config.paths.packages + pack,
            packFilePath = config.paths.packages + pack + ".zip";

        logger.info("Packing everthing up.");

        // Remove old working folder pack
        try {
            if (fs.statSync(config.paths.packages + pack).isDirectory()) {
                deleteFolderRecursiveSync(config.paths.packages + pack);
                logger.info("Removed working folder pack '" + config.paths.packages + pack + "'");
            }
        } catch (e) {
            logger.error("nothing deleted. " + e);
        }

        // Created folder for pack
        if (!fs.existsSync(config.paths.packages + pack)) {
            fs.mkdirSync(config.paths.packages + pack);
        }
        logger.info("Created folder for pack '" + config.paths.packages + pack + "'");

        // Copy Files to release directory
        logger.info("Copy Files to release directory...");
        // Copy ressourcepack to release directory
        if (fs.statSync(config.paths.resourcepacks).isDirectory()) {
            fs.copySync(
                config.paths.resourcepacks,
                config.paths.packages + pack + "/" + config.paths.resourcepacks,
                {preserveTimestamps: true}
            );
            logger.info("Added resource packs from '" + config.paths.resourcepacks + "'.");
        }

        // Copy repo files to release directory
        ["bin", "mods", "config"].forEach(function (folder) {
            try {
                if (fs.statSync(path + folder).isDirectory()) {
                    fs.copySync(
                        path + folder,
                        config.paths.packages + pack + "/" + folder,
                        {preserveTimestamps: true}
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
    };


exports.createModPackFromBranch = createModPackFromBranch;
exports.createModPackFromTag = createModPackFromTag;