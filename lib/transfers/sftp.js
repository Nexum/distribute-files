"use strict";

var Transfer = require('../Transfer');
var sftp = require('ssh2-sftp-client');
var path = require('path');
var Promise = require("bluebird");

module.exports = class SftpTransfer extends Transfer {

    transfer(file, targetFile) {
        return new Promise((resolve, reject) => {
            if (!targetFile) {
                targetFile = file;
            }

            if (this.config.root) {
                targetFile = path.join(this.config.root, targetFile);
            }

            targetFile = path.resolve(targetFile);

            // normalize for unix
            targetFile = targetFile.split(path.sep).join("/");
            var tmpFilename = targetFile + "_tmp_" + Date.now();
            var conn = new sftp();
            var targetPath = path.dirname(tmpFilename);

            return conn.connect(this.config.connection).then(() => {
                return conn.mkdir(targetPath, true);
            }, (err) => {
                reject(new Error("Couldn't create target directory on the server: " + err));
            }).then(() => {
                return conn.put(file, tmpFilename, this.config.connection.useCompression);
            }, (err) => {
                reject(new Error("Couldn't connect to server: " + err));
            }).then(() => {
                return conn.delete(targetFile).then(() => {
                    return Promise.resolve();
                }, (err) => {
                    return Promise.resolve(); // if it doesn't exists, ignore this error...
                });
            }, (err) => {
                reject(new Error("Couldn't put the file " + file + " to the server at + " + tmpFilename + ": " + err));
            }).then(() => {
                return conn.rename(tmpFilename, targetFile);
            }).then(() => {
                conn.end();
                return resolve();
            }, (err) => {
                return conn.delete(tmpFilename, function (err2) {
                    conn.end();
                    return reject(err);
                });
            });
        })
    }

}