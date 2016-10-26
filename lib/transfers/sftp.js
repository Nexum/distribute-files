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

            // normalize for unix
            targetFile = targetFile.split(path.sep).join("/");
            var tmpFilename = targetFile + "_tmp_" + Date.now();
            var conn = new sftp();

            return conn.connect(this.config.connection).then(() => {
                return conn.put(file, tmpFilename, this.config.connection.useCompression);
            }, reject).then(() => {
                return conn.rename(tmpFilename, targetFile);
            }, reject).then(() => {
                return resolve();
            }, (err) => {
                return conn.delete(tmpFilename, function (err2) {
                    return reject(err);
                });
            });
        })
    }

}