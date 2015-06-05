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

    describe ("Create a new DB Test Suite", function() {
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

        it ("should export the whole DB (all graphs) if no graph-uri was passed", function (done) {
            var options = {
                "database" : "ng"
            };

            conn.exportDB(options, function (data, response) {
                expect(response.statusCode).to.be(200);

                expect(data).not.to.be(null);
                expect(data).not.to.be(undefined);

                // 3 graphs, which include the triples in the default graph,
                // which make reference to the named-graph URI
                expect(data.length).to.be(3);

                done();
            });
        });

        it ("should export the default graph", function (done) {
            var options = {
                "database" : "ng",
                "graphUri": "tag:stardog:api:context:default"
            };

            conn.exportDB(options, function (data, response) {
                expect(response.statusCode).to.be(200);

                expect(data).not.to.be(null);
                expect(data).not.to.be(undefined);

                // the individuals in the default graph
                expect(data.length).to.be(2);

                done();
            });
        });

        it ("should export a named graph", function (done) {
            var options = {
                "database": "ng",
                "graphUri": "http://example.org/namedgraphs#bob"
            };

            conn.exportDB(options, function (data, response) {
                expect(response.statusCode).to.be(200);

                expect(data).not.to.be(null);
                expect(data).not.to.be(undefined);

                // should have the @graph tag with a JSON object as value, including the NG URI
                expect(data.length).to.be(1);
                expect(data[0]).to.have.property("@graph");

                expect(data[0]).to.have.property("@id");
                expect(data[0]["@id"]).to.be("http://example.org/namedgraphs#bob");

                done();
            });
        });

    });
}));
