/**
 * Created by reiji-maigo on 30.12.2015.
 */
var createModPackFromBranch = function (branch) {
        var github = require("./github"),
            rmdir = require("rimraf"),
            fs = require("fs"),
            path = "tmp/branch/" + branch;

        fs.exists(path, function () {
            rmdir(path, function (error) {
            });
            github.cloneBranch(branch, path);
        });
    },
    createModPackFromTag = function (tag) {
        var github = require("./github"),
            rmdir = require("rimraf"),
            fs = require("fs"),
            path = "tmp/tag/" + tag;

        fs.exists(path, function () {
            rmdir(path, function (error) {
            });
            github.cloneTag(tag, path);
        });
    };

exports.createModPackFromBranch = createModPackFromBranch;
exports.createModPackFromTag = createModPackFromTag;