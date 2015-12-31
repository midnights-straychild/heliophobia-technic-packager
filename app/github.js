/**
 * Created by reiji-maigo on 30.12.2015.
 */
var defaultBranch = 'master',
    defaultTag = '1.0.0',
    cloneBranch = function (branch, path) {
        var clone = require("nodegit").Clone.clone,
            options = {};

        branch = typeof branch !== 'undefined' ? branch : defaultBranch;
        options.checkoutBranch = branch;

        clone("https://github.com/midnights-straychild/heliophobia-custom.git", path, options)
            .then(function (repo) {})
            .catch(function (err) {
                console.log(err);
            });
    },
    cloneTag = function (tag, path) {
        var clone = require("nodegit").Clone.clone,
            options = {};

        tag = typeof tag !== 'undefined' ? tag : defaultTag;
        options.version = tag;

        clone("https://github.com/midnights-straychild/heliophobia-custom.git", path, options)
            .then(function (repo) {})
            .catch(function (err) {
                console.log(err);
            });
    };

exports.cloneBranch = cloneBranch;
exports.cloneTag = cloneTag;