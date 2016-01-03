'use strict';

var fs = require("fs"),
    JSZip = require("JSZip"),
    Zip;

/**
 *
 */
Zip = function () {
    this.workingFile = new JSZip();
};

/**
 * Recursively adds files and folders
 *
 * @param sourceFolder
 * @param targetFolder
 */
Zip.prototype.addLocalFolder = function (sourceFolder, targetFolder) {
    var currentFolder,
        that = this;

    currentFolder = this.workingFile.folder(targetFolder);

    fs.readdirSync(sourceFolder).forEach(function(file) {
        if(file.isDirectory) {
            that.addLocalFolder(sourceFolder + "/" + file.name, targetFolder + "/" + file.name);
        } else {
            currentFolder.file(file.name, fs.readFileSync(file));
        }
    });
};

/**
 *
 * @param path
 */
Zip.prototype.compressAndWriteZip = function (path) {
    var data = JSZip.generate({base64: false, compression: 'DEFLATE'});

    fs.writeFileSync(path, data, 'binary');
};