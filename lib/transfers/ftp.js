"use strict";

var Transfer = require('../Transfer');
var ftp = require('ftp');
var path = require('path');
var Promise = require("bluebird");

module.exports = class FtpTransfer extends Transfer {


    setupConnection() {
        this.conn = new ftp();
    }

    connect() {
        if (this.connected) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.conn.connect(this.config.connection);
            this.conn.on('ready', () => {
                this.connected = true;
                resolve();
            });
        });
    }

    disconnect() {
        if (!this.connected) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.connected = false;
            this.conn.end();
            resolve();
        });
    }

    remove(file, leaveConnectionOpen) {
        return new Promise((resolve, reject) => {
            if (this.config.root) {
                file = path.join(this.config.root, file);
            }

            file = path.resolve(file);
            file = path.normalize(file.split(path.sep).join("/"));

            if (os.platform() === "win32") {
                file = file.replace("C:", "");
                file = file.replace(/\\/g, "/");
            }

            return this.connect(this.config.connection).then(() => {
                return this.conn.delete(file);
            }, (err) => {
                reject(new Error("Couldn't connect to server: " + err));
            }).then(() => {
                if (!leaveConnectionOpen) {
                    return this.disconnect().then(() => {
                        return Promise.resolve();
                    });
                }
                return resolve();
            }, (err) => {
                if (!leaveConnectionOpen) {
                    return this.disconnect().then(() => {
                        return reject(new Error("Couldn't delete "+ file +" on the server: " + err));
                    });
                }
                return reject(new Error("Couldn't delete "+ file +" on the server: " + err));
            });
        });
    }

    transfer(file, targetFile, leaveConnectionOpen) {
        return new Promise((resolve, reject) => {

            if (!targetFile) {
                targetFile = file;
            }

            if (this.config.root) {
                targetFile = path.join(this.config.root, targetFile);
            }

            // normalize for unix
            targetFile = targetFile.split(path.sep).join("/");
            var targetDir = targetFile.replace(/\/[^\/]+$/,'');
            var tmpFilename = targetFile + "_tmp_" + Date.now();

            return this.connect().then(() => {
                this.conn.mkdir(targetDir,true, (err) => {
                    if (err) {
                        return reject(new Error(err));
                    }
                    this.conn.put(file, tmpFilename, (err) => {
                        if (err) {
                            return reject(new Error(err));
                        }

                        this.conn.rename(tmpFilename, targetFile, (err) => {
                            if (err) {
                                return this.conn.delete(tmpFilename, (err2) => {
                                    return reject(new Error(err));
                                });
                            }

                            if (!leaveConnectionOpen) {
                                this.disconnect();
                            }
                            return resolve();
                        });
                    });
                });

                this.conn.on('error', function (err) {
                    if (!leaveConnectionOpen) {
                        this.disconnect();
                    }
                    return reject(new Error(err));
                });
            }, reject);
        });
    }
}
