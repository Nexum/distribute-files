"use strict";

var Distributor = require("../index.js").Distributor;
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;
var expect = chai.expect;

describe('Distributor', function () {

    it('should not contain typos ...', function () {
        assert.ok(new Distributor());
    });

    it('should detect non existent files', function () {
        return expect(new Distributor().distributeFile("XXXXXXXXXXX")).to.eventually.be.rejected;
    });

    describe('FTP', function () {

        it('should transfer one', function (done) {
            this.timeout(10000);
            new Distributor({
                root: process.cwd(),
                servers: [
                    {
                        type: "ftp",
                        connection: {
                            host: "speedtest.tele2.net"
                        },
                        root: "/upload"
                    }
                ]
            }).distributeFile("/test/data/file1.txt", "file1.txt").then(() => {
                done();
            }, (err) => {
                if (err.toString() === "Error: Error: Permission denied.") {
                    return done();
                }

                done(err);
            })
        });

        it('should transfer multiple', function (done) {
            this.timeout(10000);
            new Distributor({
                root: process.cwd(),
                servers: [
                    {
                        type: "ftp",
                        connection: {
                            host: "speedtest.tele2.net"
                        },
                        root: "/upload"
                    }
                ]
            }).distributeFiles([
                "/test/data/file1.txt",
                "/test/data/file2.txt",
                "/test/data/file3.txt"
            ], [
                "file1.text",
                "file2.text",
                "file3.text"
            ]).then(() => {
                done();
            }, (err) => {
                if (err.toString() === "Error: Error: Permission denied.") {
                    return done();
                }

                done(err);
            })
        });

    });

    describe('SFTP', function () {

        it('should transfer one', function (done) {
            this.timeout(10000);
            new Distributor({
                root: process.cwd(),
                servers: [
                    {
                        type: "sftp",
                        connection: {
                            port: 2222,
                            host: "demo.wftpserver.com",
                            user: "demo-user",
                            password: "demo-user"
                        },
                        root: "/"
                    }
                ]
            }).distributeFile("/test/data/file1.txt", "file1.text").then(() => {
                done();
            }, (err) => {
                if (err.toString() === "Error: Cannot STOR. No permission.") {
                    return done();
                }

                return done(err);
            })
        });

        it('should transfer multiple', function (done) {
            this.timeout(10000);
            new Distributor({
                root: process.cwd(),
                servers: [
                    {
                        type: "sftp",
                        connection: {
                            port: 2222,
                            host: "demo.wftpserver.com",
                            user: "demo-user",
                            password: "demo-user"
                        },
                        root: "/"
                    }
                ]
            }).distributeFiles([
                "/test/data/file1.txt",
                "/test/data/file2.txt",
                "/test/data/file3.txt"
            ], [
                "file1.text",
                "file2.text",
                "file3.text"
            ]).then(() => {
                done();
            }, (err) => {
                if (err.toString() === "Error: Cannot STOR. No permission.") {
                    return done();
                }

                return done(err);
            })
        });

    });

    describe('SFTP + FTP', function () {

        it('should transfer one', function (done) {
            this.timeout(10000);
            new Distributor({
                root: process.cwd(),
                servers: [
                    {
                        type: "sftp",
                        connection: {
                            port: 2222,
                            host: "demo.wftpserver.com",
                            user: "demo-user",
                            password: "demo-user"
                        },
                        root: "/"
                    },
                    {
                        type: "ftp",
                        connection: {
                            host: "speedtest.tele2.net"
                        },
                        root: "/upload"
                    }
                ]
            }).distributeFile("/test/data/file1.txt", "file1.text").then(() => {
                done();
            }, (err) => {
                if (err.toString() === "Error: Cannot STOR. No permission.") {
                    return done();
                }

                if (err.toString() === "Error: Error: Permission denied.") {
                    return done();
                }

                return done(err);
            })
        });

        it('should transfer multiple', function (done) {
            this.timeout(10000);
            new Distributor({
                root: process.cwd(),
                servers: [
                    {
                        type: "sftp",
                        connection: {
                            port: 2222,
                            host: "demo.wftpserver.com",
                            user: "demo-user",
                            password: "demo-user"
                        },
                        root: "/"
                    },
                    {
                        type: "ftp",
                        connection: {
                            host: "speedtest.tele2.net"
                        },
                        root: "/upload"
                    }
                ]
            }).distributeFiles([
                "/test/data/file1.txt",
                "/test/data/file2.txt",
                "/test/data/file3.txt"
            ], [
                "file1.text",
                "file2.text",
                "file3.text"
            ]).then(() => {
                done();
            }, (err) => {
                if (err.toString() === "Error: Cannot STOR. No permission.") {
                    return done();
                }

                if (err.toString() === "Error: Error: Permission denied.") {
                    return done();
                }

                return done(err);
            })
        });

    });


});