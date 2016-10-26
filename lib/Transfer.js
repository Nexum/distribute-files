"use strict";
var Promise = require("bluebird");

module.exports = class Transfer {

    /**
     * take and modify the config if needed
     * by default user will also be rewritten to username since a lot of modules tend to use one of both so whichever the user likes, he can use :)
     *
     * @param config
     */
    constructor(config) {
        if (!config) {
            config = {};
        }

        this.config = config;

        if (this.config.connection) {
            if (this.config.connection.user && !this.config.connection.username) {
                this.config.connection.username = this.config.connection.user;
            } else if (this.config.connection.username && !this.config.connection.user) {
                this.config.connection.user = this.config.connection.username;
            }
        }
    }

    /**
     * Do the actual transfer here
     *
     * @param file
     * @param targetFile
     * @returns {Promise.<T>}
     */
    transfer(file, targetFile) {
        return Promise.resolve();
    }

}