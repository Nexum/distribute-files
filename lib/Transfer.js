"use strict";
var Promise = require("bluebird");
var fs = require("fs");

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
        this.connected = false;

        if (this.config.connection) {
            if (this.config.connection.user && !this.config.connection.username) {
                this.config.connection.username = this.config.connection.user;
            } else if (this.config.connection.username && !this.config.connection.user) {
                this.config.connection.user = this.config.connection.username;
            }

            if (this.config.connection.privateKeyPath) {
                try {
                    this.config.connection.privateKey = fs.readFileSync(this.config.connection.privateKeyPath);
                } catch (e) {
                    throw new Error("Error while trying to load private key from " + this.config.connection.privateKeyPath);
                }
            }
        }

        this.setupConnection();
    }

    /**
     * setup the connection
     */
    setupConnection() {

    }

    /**
     * connect to the server if necessary
     *
     * @returns {Promise.<T>}
     */
    connect() {
        this.connected = true;
        return Promise.resolve();
    }

    /**
     * disconnect from the server if necessary
     *
     * @returns {Promise.<T>}
     */
    disconnect() {
        this.connected = false;
        return Promise.resolve();
    }

    /**
     * Do the actual transfer here
     *
     * @param string file
     * @param string targetFile
     * @param boolean leaveConnectionOpen
     * @returns {Promise.<T>}
     */
    transfer(file, targetFile, leaveConnectionOpen) {
        return Promise.resolve();
    }

}