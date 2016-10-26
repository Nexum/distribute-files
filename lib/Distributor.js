"use strict";

var fs = require("fs");
var path = require("path");
var transfers = require("./transfers");
var Promise = require("bluebird");

module.exports = class Distributor {

    /**
     * The Constructor, takes the config as parameter
     *
     * **Config sample**
     * ```
     *  {
     *      debug: Boolean,
     *      root: String,     // The Root for all local files, leave empty if none should be used, you will have to supply an absolute path later,
     *      servers: [
     *          {
     *              type: "ftp",
     *              connection: { // see https://www.npmjs.com/package/ftp for all available options
     *                  host: "example.com",
     *                  port: 21,
     *                  user: "foo",
     *                  password: "bar"
     *              },
     *              root: null // if you supply a root, all target paths will be prefixed, ths is to enable different roots on different servers
     *          }, {
     *              type: "sftp",
     *              connection: { // see https://www.npmjs.com/package/ssh2 for all available options
     *                  host: "example.com",
     *                  port: 22,
     *                  user: "foo",    // alias for the original username param, you can use both this is just to keep the api clean(ish)
     *                  password: "bar"
     *              },
     *              root: null // if you supply a root, all target paths will be prefixed, ths is to enable different roots on different servers
     *          },
     *          function(file) { // completely custom transfer function, is expected to return a Promise, if you do something cool, add it to the transfer methods and pull request?
     *
     *          }
     *      ]
     *  }
     * ```
     *
     * @param object config
     */
    constructor(config) {
        this.config = config || {};

        // config defaults
        if (!this.config.debug) {
            this.config.debug = false;
        }

        if (!this.config.root) {
            this.config.root = false;
        }

        if (!this.config.servers) {
            this.config.servers = [];
        }

        // health check on server configurations
        for (var i = 0; i < this.config.servers.length; i++) {
            var server = this.config.servers[i];

            if (typeof server === "function") {
                continue;
            }

            if (!server.type) {
                throw new Error("Server is missing type [" + Object.keys(transfers).join(",") + "]");
            }

            if (!transfers[server.type]) {
                throw new Error("Server type " + server.type + " is not available [" + Object.keys(transfers).join(",") + "]");
            }
        }
    }

    /**
     * Distributes a single File to all configured Servers
     *
     * @param string file
     * @param string targetFile
     * @returns {Promise}
     */
    distributeFile(file, targetFile) {
        var filePath = null;

        // resolve part to configured root dir
        if (this.config.root) {
            filePath = path.resolve(path.join(this.config.root, file));
        } else {
            filePath = path.resolve(file);
        }

        // Check if source file exists
        try {
            fs.accessSync(filePath)
        } catch (e) {
            return Promise.reject(new Error("File " + filePath + " does not exists"));
        }

        return Promise.map(this.config.servers, (server) => {
            if (typeof server === "function") {
                return server(filePath);
            }

            if (!server.type) {
                throw new Error("Server is missing type [" + Object.keys(transfers).join(",") + "]");
            }

            if (!transfers[server.type]) {
                throw new Error("Server type " + server.type + " is not available [" + Object.keys(transfers).join(",") + "]");
            }

            var transfer = new transfers[server.type](server);

            if (this.config.debug) {
                console.log("Distributing " + filePath + " using " + server.type);
            }

            return transfer.transfer(filePath, targetFile);
        })
    }

    /**
     * Distributes multiple Files to all configured Servers
     *
     * @param array files
     * @param array targetFiles
     * @returns {Promise}
     */
    distibuteFiles(files, targetFiles) {
        return Promise.map(files, (file) => {
            return this.distibuteFile(file, targetFiles);
        });
    }

}
