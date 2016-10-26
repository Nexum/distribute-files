"use strict";

var Transfer = require('../Transfer');
var ftp = require('ftp');
var path = require('path');
var Promise = require("bluebird");

module.exports = class FtpTransfer extends Transfer {

    transfer(file, targetFile) {
        return new Promise((resolve, reject) => {
            var conn = new ftp(this.config.connection);

            if (!targetFile) {
                targetFile = file;
            }

            if (this.config.root) {
                targetFile = path.join(this.config.root, targetFile);
            }

            conn.on('ready', function () {
                console.log(file, targetFile);
                conn.put(file, targetFile, function (err) {
                    if (err) {
                        return reject(new Error(err));
                    }

                    conn.end();
                    return resolve();
                });
            });
            conn.on('error', function (err) {
                return reject(new Error(err));
            });

            conn.connect();
        });
    }

}