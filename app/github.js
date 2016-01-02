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

        clone(config.repo, path)
            .then(function () {
                Repository.open(path)
                    .then(function (repo) {
                        repo.fetchAll();
                    });

                callback(path, branch);
            })
            .catch(function (err) {
                logger.error(err);
            });
    },

    checkoutBranch = function (branchName, path, callback) {
        var Branch = NodeGit.Branch;

        Repository.open(path).then(function (repo) {
            return Promise.resolve(repo.getBranchCommit(branchName));
        }).then(function (commit) {
            return Branch.create(repo, branchName, commit, 0)
        }).then(function (reference) {
            Branch.setUpstream(reference, branchName);
            repo.checkoutBranch(reference)
        }).then(function () {
            callback(path, branchName);
        });
    },

    checkoutTag = function (tagName, path, callback) {
        var Checkout = NodeGit.Checkout;

        Repository.open(path)
            .then(function (repo) {
                repo.getTagByName(tagName)
                    .then(function (oid) {
                        Checkout.tree(repo, oid, {checkoutStrategy: Checkout.STRATEGY.SAFE_CREATE})
                            .then(function () {
                                repo.setHeadDetached(oid, repo.defaultSignature, "Checkout: HEAD " + oid);
                            })
                            .done(function () {
                                logger.info("Checkout done of tag '" + branchName + "'.");

                                callback(path, branchName);
                            });
                    });
            });
    };

exports.cloneBranch = cloneBranch;
exports.checkoutBranch = checkoutBranch;
exports.checkoutTag = checkoutTag;