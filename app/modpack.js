/**
 * Created by reiji-maigo on 30.12.2015.
 */
var github = require("./github"),
    fs = require("fs"),
    config = require("./config.js").config,
    logger = require("./logger.js").getLogger(),
    email = require("./email.js"),

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
            github.updateBranch(branch, path, createZip);
        } else {
            logger.info("Repository not available. Cloning...");
            github.cloneBranch(branch, path, createZip);
        }
    },

    createModPackFromTag = function (oid, ref) {
        if (GLOBAL.runMode === "undefined") {
            logger.error("Run-Mode not set");
            process.exit(1);
        }

        logger.info("Run-Mode: '" + GLOBAL.runMode + "'");
        logger.info("Attempting to deploy Modpack for oid '" + oid + "'");

        var path = "tmp/" + GLOBAL.runMode + "/";

        if (!fs.existsSync(path)) {
            logger.info("Repository not available. Cloning...");
            github.cloneBranch("master", path, createZip);
        }

        logger.info("Repository available. Updating...");
        github.updateTag(oid, path, ref, createZip);
    },

    createZip = function (path, branchOrTag) {
        var AdmZip = require("adm-zip"),
            targetFile = config.packName + "-" + branchOrTag + ".zip",
            zip = new AdmZip();

        logger.info("Packing everthing up.");

        if (fs.statSync(path).isDirectory()) {
            [ "bin", "mods", "config"].forEach(function(folder) {
                try {
                    if (fs.statSync(path + folder).isDirectory()) {
                        zip.addLocalFolder(path + folder, "../../" + folder);
                        logger.info("Added '" + folder + "' from '" + path + "'.");
                    }
                } catch(e) {
                    logger.warn("Folder '" +  path + folder + "' not found!");
                }
            });
        }

        if (fs.statSync(config.paths.resourcepacks).isDirectory()) {
            zip.addLocalFolder(config.paths.resourcepacks, config.paths.resourcepacks);
            logger.info("Added resource packs from '" + config.paths.resourcepacks + "'.");
        }

        try {
            if (fs.statSync(config.paths.packages + targetFile).isFile()) {
                fs.unlinkSync(config.paths.packages + targetFile);
                logger.info("Removed existing pack '" + config.paths.packages + targetFile + "'");
            }
        } catch(e) {
            // do nothing
        }

        if (fs.statSync(config.paths.packages).isDirectory()) {
            logger.info("Compressing...");
            zip.writeZip(config.paths.packages + targetFile);
            logger.info("Put everything to '" + config.paths.packages + targetFile + "'.");
        }

        try {
            email.send("Pack build finished","bla");
            logger.info("Email sent to '" + config.email.sendTo + "'");
        } catch(e) {
            logger.error("Email sending failed: '" + e + "'");
        }

    };

exports.createModPackFromBranch = createModPackFromBranch;
exports.createModPackFromTag = createModPackFromTag;