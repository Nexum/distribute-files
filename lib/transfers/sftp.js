"use strict";

var Transfer = require('../Transfer');
var sftp = require('ssh2-sftp-client');
var path = require('path');
var Promise = require("bluebird");

module.exports = class SftpTransfer extends Transfer {

    transfer(file, targetFile) {
        if (!targetFile) {
            targetFile = file;
        }

        if (this.config.root) {
            targetFile = path.join(this.config.root, targetFile);
        }

        // normalize for unix
        targetFile = targetFile.split(path.sep).join("/");

        var conn = new sftp();

        return conn.connect(this.config.connection).then(() => {
            return conn.put(file, targetFile, this.config.connection.useCompression);
        })
    }

}