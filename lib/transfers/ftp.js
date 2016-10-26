"use strict";

var Transfer = require('../Transfer');
var ftp = require('ftp');
var path = require('path');
var Promise = require("bluebird");

module.exports = class FtpTransfer extends Transfer {

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

            var conn = new ftp();
            conn.on('ready', function () {
                conn.put(file, targetFile, function (err) {
                    if (err) {
                        return reject(new Error(err));
                    }

                    conn.end();
                    return resolve();
                });
            });

            conn.on('error', function (err) {
                conn.end();
                return reject(new Error(err));
            });

            conn.connect(this.config.connection);
        });
    }

}