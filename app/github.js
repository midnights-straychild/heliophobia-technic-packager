/**
 * Created by reiji-maigo on 30.12.2015.
 */
var config = require("./config.js").config,
    logger = require("./logger.js").getLogger(),
    NodeGit = require("nodegit"),
    Repository = NodeGit.Repository,

    cloneBranch = function (branch, path, callback) {
        var clone = NodeGit.Clone.clone,
            options = {};

        branch = typeof branch !== 'undefined' ? branch : config.defaultBranch;
        options.checkoutBranch = branch;

        clone(config.repo, path, options)
            .then(function () {
                callback(path, branch);
            })
            .catch(function (err) {
                logger.error(err);
            });
    },

    updateBranch = function (branch, path, callback) {
        var Checkout = NodeGit.Checkout,
            options = {};

        branch = typeof branch !== 'undefined' ? branch : config.defaultBranch;
        options.checkoutBranch = branch;

        Repository.open(path).then(function (repo) {
            return Checkout.head(repo)
                .then(function () {
                    callback(path, branch);
                })

        })
            .catch(function (error) {
                logger.error(err);
            });
    },

    updateTag = function (oid, path, ref, callback) {
        var Checkout = NodeGit.Checkout,
            Tag = NodeGit.Tag;

        Repository.open(path).then(function (repo) {
            return Checkout.tree(repo, oid, {checkoutStrategy: Checkout.STRATEGY.SAFE_CREATE})
                .then(function () {
                    repo.setHeadDetached(oid, repo.defaultSignature, "Checkout: HEAD " + oid);
                })
                .done(function () {
                    var tag = ref.split("/")[2];

                    logger.info("Checkout done of tag '" + tag + "'.");

                    callback(path, tag);
                });
        });
    };

exports.cloneBranch = cloneBranch;
exports.updateBranch = updateBranch;
exports.updateTag = updateTag;