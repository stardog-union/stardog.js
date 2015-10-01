(function (root, factory) {
    "use strict";

    if (typeof exports === "object") {
        // NodeJS. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require("../js/stardog.js"), require("expect.js"));
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["stardog", "expect"], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog, root.expect);
    }
}(this, function (Stardog, expect) {
    "use strict";

    describe ("Export a DB Test Suite", function() {
        var conn;

        this.timeout(50000);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
        });

        afterEach(function() {
            conn = null;
        });

        it ("should return a response with content-disposition header and the attachment export file", function (done) {
            var options = {
                "database" : "ng"
            };

            conn.exportDB(options, function (data, response) {
                expect(response.statusCode).to.be(200);

                expect(response.headers['content-disposition']).not.to.be(null);
                expect(response.headers['content-disposition']).not.to.be(undefined);
                expect(response.headers['content-disposition']).to.be("attachment; filename=export.jsonld");

                done();
            });
        });

        it ("should return a response with content-disposition header and the attachment export file when using graph-uri param", function (done) {
            var options = {
                "database" : "ng",
                "graphUri": "tag:stardog:api:context:default"
            };

            conn.exportDB(options, function (data, response) {
                expect(response.statusCode).to.be(200);

                expect(response.headers['content-disposition']).not.to.be(null);
                expect(response.headers['content-disposition']).not.to.be(undefined);
                expect(response.headers['content-disposition']).to.be("attachment; filename=export.jsonld");

                done();
            });
        });

    });
}));
