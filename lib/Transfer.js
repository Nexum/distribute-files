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
        if (this.config.user && !this.config.username) {
            this.config.username = this.config.user;
        } else if (this.config.username && !this.config.user) {
            this.config.user = this.config.username;
        }

        this.config = config;
    }

    /**
     * Do the actual transfer here
     *
     * @param file
     * @returns {Promise.<T>}
     */
    transfer(file) {
        return Promise.resolve();
    }

}