"use strict";

var Transfer = require('../Transfer');
var path = require('path');
var fs = require("fs");
var Promise = require("bluebird");
var moment = require("moment");

module.exports = class FileTransfer extends Transfer {

    getCurrentQueueFile() {
        return path.join(this.config.queue, moment().format("DD-MM-YYYY_HH-mm[.txt]"))
    }

    ensureQueue(file) {
        try {
            fs.statSync(file);
        } catch (e) {
            fs.writeFileSync(file, "");
        }
    }

    addToQueue(line) {
        let file = this.getCurrentQueueFile();
        this.ensureQueue(file);
        if (!this.isInQueue(file, line)) {
            fs.appendFileSync(file, line);
        }
    }

    isInQueue(file, line) {
        let content = fs.readFileSync(file).toString();
        return content.indexOf(line) !== -1;
    }

    remove(file) {
        return Promise.resolve();
    }

    transfer(file, targetFile) {
        if (!targetFile) {
            targetFile = file;
        }

        file = file.replace(/[\/]+/g, "/");
        targetFile = targetFile.replace(/[\/]+/g, "/");

        this.addToQueue(file + " " + targetFile + "\n");

        return Promise.resolve();
    }
}
