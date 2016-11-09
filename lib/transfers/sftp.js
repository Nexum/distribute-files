"use strict";

var Transfer = require('../Transfer');
var sftp = require('ssh2-sftp-client');
var path = require('path');
var Promise = require("bluebird");

module.exports = class SftpTransfer extends Transfer {

    setupConnection() {
        this.conn = new sftp();
    }

    connect() {
        if (this.connected) {
            return new Promise((resolve, reject) => {
                this.sftp = this.conn;
                resolve();
            });
        }

        return this.conn.connect(this.config.connection);
    }

    disconnect() {
        if (!this.connected) {
            return Promise.resolve();
        }

        return this.conn.end();
    }

    transfer(file, targetFile, leaveConnectionOpen) {
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
            var targetPath = path.dirname(tmpFilename);

            return this.connect(this.config.connection).then(() => {
                return this.conn.mkdir(targetPath, true);
            }, (err) => {
                reject(new Error("Couldn't connect to server: " + err));
            }).then(() => {
                return this.conn.put(file, tmpFilename, this.config.connection.useCompression);
            }, (err) => {
                reject(new Error("Couldn't create target directory on the server: " + err));
            }).then(() => {
                return this.conn.delete(targetFile).then(() => {
                    return Promise.resolve();
                }, (err) => {
                    return Promise.resolve(); // if it doesn't exists, ignore this error...
                });
            }, (err) => {
                reject(new Error("Couldn't put the file " + file + " to the server at + " + tmpFilename + ": " + err));
            }).then(() => {
                return this.conn.rename(tmpFilename, targetFile);
            }).then(() => {
                return resolve();
            }, (err) => {
                return this.conn.delete(tmpFilename, function (err2) {
                    return reject(err);
                });
            }).then(() => {
                if (!leaveConnectionOpen) {
                    this.disconnect();
                }

                return Promise.resolve();
            }, (err) => {
                if (!leaveConnectionOpen) {
                    this.disconnect();
                }

                return Promise.reject(err);
            });
        })
    }

}