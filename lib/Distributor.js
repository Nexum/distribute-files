"use strict";

var fs = require("fs");
var path = require("path");
var transfers = require("./transfers");
var Promise = require("bluebird");
var mkdirp = require('mkdirp');
var os = require('os');
var recursive = require("recursive-readdir");

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
        this.servers = [];

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

        // setup servers
        for (var i = 0; i < this.config.servers.length; i++) {
            var server = this.config.servers[i];
            this.addServer(server);
        }
    }

    /**
     * Add a Server to the configuration (and initiate the connection)
     *
     * @param object server @see constructor
     */
    addServer(server) {
        if (typeof server === "function") {
            this.servers.push({
                transfer: server
            });
            return;
        }

        if (!server.type) {
            throw new Error("Server is missing type [" + Object.keys(transfers).join(",") + "]");
        }

        if (!transfers[server.type]) {
            throw new Error("Server type " + server.type + " is not available [" + Object.keys(transfers).join(",") + "]");
        }

        if (this.config.debug) {
            server.debug = true;
        } else {
            server.debug = false;
        }

        this.servers.push(function () {
            return new transfers[server.type](server);
        });
        return;
    }

    /**
     * Distributes a single File to all configured Servers
     *
     * @param string file
     * @param string targetFile
     * @returns {Promise}
     */
    distributeFile(file, targetFile, isQueue) {
        var filePath = path.resolve(file);

        // resolve part to configured root dir
        if (!isQueue) {
            if (this.config.root) {
                filePath = path.resolve(path.join(this.config.root, file));
            }
        }

        // Check if source file exists
        try {
            fs.accessSync(filePath)
        } catch (e) {
            return Promise.reject(new Error("File " + filePath + " does not exists"));
        }

        // Loop over Servers and start the transfer
        return Promise.map(this.servers, (server) => {

            // new connection per transfer, things got a bit weird with one connection...
            server = server();

            if (this.config.debug) {
                console.log("Distributing " + filePath + " using " + server.config.type + " to " + targetFile);
            }

            if (this.config.fake) {
                console.log("NOT ACTUALLY DISTRIBUTING, Distributor is in fake mode!");
                return Promise.resolve();
            }

            return server.transfer(filePath, targetFile);
        }).then(() => {
            if (this.config.debug) {
                console.log("Distributed " + filePath);
            }

            if (isQueue) {
                try {
                    //fs.unlink(filePath);
                } catch (e) {

                }
            }

            return Promise.resolve();
        }, (e) => {
            if (this.config.debug) {
                console.error(e);
            }

            if (!isQueue) {
                this.putIntoQueue(filePath, targetFile);
            }

            return Promise.reject(e);
        })
    }

    putIntoQueue(filePath, targetFile) {
        if (!this.config.errordir) {
            console.log("No errordir set, no queue available!!");
            return;
        }

        // create folders if necessary
        mkdirp.sync(this.config.errordir);
        mkdirp.sync(path.join(this.config.errordir, path.dirname(targetFile)));

        // copy file to queue folder
        fs.writeFileSync(path.join(this.config.errordir, targetFile), fs.readFileSync(filePath));
    }

    processQueue() {
        return new Promise((resolve, reject) => {
            if (!this.config.errordir) {
                console.log("No errordir set, no queue available!!");
                return resolve();
            }

            return recursive(this.config.errordir, (err, files) => {
                if (files) {
                    files = files.filter(v => [
                        ".",
                        ".."
                    ].indexOf(v) === -1);
                }

                if (!files || !files.length) {
                    return resolve();
                }

                return Promise.map(files, (file) => {
                    if (os.platform() === "win32") {
                        file = file.replace(/\\/g, "/");
                    }

                    return this.distributeFile(file, file.replace(this.config.errordir, ""), true);
                }).then(resolve, (err) => {
                    console.error(err);
                    return resolve();
                });
            });
        });
    }

    connectAllServers() {
        return Promise.map(this.servers, (server) => {
            return server.connect();
        });
    }

    disconnectAllServers() {
        return Promise.map(this.servers, (server) => {
            return server.disconnect();
        });
    }

    /**
     * Distributes multiple Files to all configured Servers
     *
     * @param array files
     * @param array targetFiles
     * @param number concurrency How many files we should distribute at once default is infinite
     * @returns {Promise}
     */
    distributeFiles(files, targetFiles, concurrency) {
        // in case no target files where given, just use files to preven access to undefined errors
        if (!targetFiles) {
            targetFiles = files;
        }

        if (!concurrency) {
            concurrency = Infinity;
        }

        return Promise.map(files, (file) => {
            return this.distributeFile(file, targetFiles[files.indexOf(file)]);
        }, {
            concurrency: concurrency
        }).then(() => {
            if (this.config.debug) {
                console.log("Distributed all Files!");
            }

            return Promise.resolve();
        }, (err) => {
            if (this.config.debug) {
                console.error(err);
            }
            return Promise.reject(err);
        });
    }

}
