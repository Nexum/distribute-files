"use strict";

var Distributor = require("../index.js").Distributor;
var assert = require("assert");

describe('Distributor', function () {

    it('should not contain typos ...', function () {
        assert.ok(new Distributor());
    });

    it('should detect non existent files', function () {
        var distributor = new Distributor();
        return distributor.distributeFile("package.json").then(() => {
            console.log("what ?");
            // should never be called..
            throw new Error("The file actually exists... stop messing with the tests ;)");
        }, (err) => {
            console.log(err);
            return Promise.resolve();
        });
    });

    describe('FTP', function () {
        it('should transfer', function () {

        });
    });


});