'use strict';

/**
 * Created by reiji-maigo on 30.12.2015.
 */
var config = require("./config.js").config,
    logger = require("./logger.js").getLogger(),

    /**
     *
     * @param branchName
     * @param path
     * @param callback
     */
    cloneBranch = function (branchName, path, callback) {
        var simpleGit = require('simple-git')(path);

        branchName = typeof branchName !== 'undefined' ? branchName : config.defaultBranch;

        simpleGit.clone(config.repo, path).fetch("origin", branchName).checkout(branchName, function () {
            callback(path, branchName);
        });
    },

    /**
     *
     * @param branchName
     * @param path
     * @param callback
     */
    checkoutBranch = function (branchName, path, callback) {
        var simpleGit = require('simple-git')(path);

        simpleGit.fetch("origin", branchName).checkout(branchName, function () {
            callback(path, branchName);
        });
    },

    /**
     *
     * @param tagName
     * @param path
     * @param callback
     */
    checkoutTag = function (tagName, path, callback) {
        var simpleGit = require('simple-git')(path);

        simpleGit.fetch("origin", "master").checkout("tags/" + tagName, function () {
            callback(path, "master", tagName);
        });
    };

exports.cloneBranch = cloneBranch;
exports.checkoutBranch = checkoutBranch;
exports.checkoutTag = checkoutTag;