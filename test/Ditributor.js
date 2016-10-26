"use strict";

var Distributor = require("../index.js").Distributor;
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;
var expect = chai.expect;

setupFTP();

describe('Distributor', function () {

    it('should not contain typos ...', function () {
        assert.ok(new Distributor());
    });

    it('should detect non existent files', function () {
        return expect(new Distributor().distributeFile("XXXXXXXXXXX")).to.eventually.be.rejected;
    });

    describe('FTP', function () {
        it('should transfer', function () {
            return expect(new Distributor({
                root: process.cwd(),
                servers: [
                    {
                        type: "ftp",
                        connection: {
                            host: "127.0.0.1",
                            port: 14356
                        },
                        root: process.cwd()
                    }
                ]
            }).distributeFile("/test/data/file1.txt")).to.eventually.be.resolved;
        });
    });

    describe('SFTP', function () {
        it('should transfer', function () {

        });
    });

    describe('SFTP + FTP', function () {
        it('should transfer', function () {

        });
    });


});


function setupFTP() {
    var ftpd = require('ftpd');
    var ftpserver = new ftpd.FtpServer("127.0.0.1", {
        getInitialCwd: function () {
            return "/";
        },
        getRoot: function () {
            return process.cwd() + "/test/data_target/";
        },
        allowUnauthorizedTls: true
    });
    ftpserver.listen(14356);
}