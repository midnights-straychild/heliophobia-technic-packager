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
            .then(function (repo) {
                callback();
            })
            .catch(function (err) {
                logger.error(err);
            });
    },
    cloneTag = function (tag, path, callback) {
        var clone = NodeGit.Clone.clone,
            options = {};

        tag = typeof tag !== 'undefined' ? tag : config.defaultTag;
        options.version = tag;

        clone(config.repo, path, options)
            .then(function (repo) {
                callback();
            })
            .catch(function (err) {
                logger.error(err);
            });
    },
    updateBranch = function (branch, path, callback) {
        var Branch = NodeGit.Branch,
            options = {};

        branch = typeof branch !== 'undefined' ? branch : config.defaultBranch;
        options.checkoutBranch = branch;

        Repository.open(path).then(function (repo) {
            return Branch.lookup(repo, branch)
                .then(function (reference) {

                })

        })
            .catch(function (error) {
                logger.error(err);
            });
    },
    updateTag = function (tag, path, callback) {
        var Tag = NodeGit.Tag,
            Checkout = NodeGit.Checkout;

        Repository.open(path).then(function (repo) {
                return Tag.list(repo)
                    .then(function (array) {
                        tag = typeof tag !== 'undefined' ? tag : config.defaultTag;
                        return Tag.lookup(repo, tag).catch(function (error) {
                            logger.error(error.message);
                            process.exit(1);
                        });
                    })
                    .then(function (tag) {
                        return Checkout.tree(repo, tag.targetId(), {checkoutStrategy: Checkout.STRATEGY.SAFE_CREATE})
                            .then(function () {
                                repo.setHeadDetached(tag.targetId(), repo.defaultSignature, "Checkout: HEAD " + tag.targetId());
                            })
                            .done(function() {
                                logger.info("Checkout done.")
                            });
                    });
            })
            .catch(function (error) {
                logger.error(err);
            });
    };

exports.cloneBranch = cloneBranch;
exports.cloneTag = cloneTag;
exports.updateBranch = updateBranch;
exports.updateTag = updateTag;