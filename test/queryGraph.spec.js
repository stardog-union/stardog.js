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

    // -----------------------------------
    // Describes the queryGraph test methods
    // -----------------------------------

    describe ("Query a DB receiving a Graph in JSON-LD", function() {
        var conn;

        this.timeout(0);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
        });

        afterEach(function() {
            conn = null;
        });

        it("A graph query for ALL result should not be empty", function(done) {
            conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {
            
                conn.queryGraph({ database: "nodeDB", query: "describe ?s" }, function (data) {
                    expect(data).not.to.be(undefined);
                    expect(data).not.to.be(null);

                    // Could be an array of JSON-LD objects
                    if (data instanceof Array) {
                        for (var i=0; i < data.length; i++) {
                            expect(data[i]).not.to.be(undefined);
                            if (data[i].attributes) {
                                // node.js
                                expect(data[i].get("@id")).not.to.be(undefined);
                            } else {
                                // browser
                                expect(data[i]["@id"]).not.to.be(undefined);
                            }
                        }
                    }
                    else {
                        if (data.attributes) {
                            // node.js
                            expect(data.get("@context")).not.to.be(undefined);
                        } else {
                            // browser
                            expect(data["@context"]).not.to.be(undefined);
                        }
                    }

                    done();
                });

            });
        });

        it("A graph query could be limited too", function(done) {
            conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.queryGraph({ database: "nodeDB", query: "describe ?s", limit: 1 }, function (data) {

                    expect(data).not.to.be(undefined);
                    expect(data).not.to.be(null);

                    // Could be an array of JSON-LD objects
                    if (data instanceof Array) {
                        for (var i=0; i < data.length; i++) {
                            expect(data[i]).not.to.be();
                            if (data[i].attributes) {
                                // node.js
                                expect(data[i].get("@id")).not.to.be(undefined);
                            } else {
                                // browser
                                expect(data[i]["@id"]).not.to.be(undefined);
                            }
                        }
                    }
                    else {
                        // At leat must have the context and an id.
                        if (data.attributes) {
                            // node.js
                            expect(data.get("@context")).not.to.be(undefined);
                            expect(data.get("@id")).not.to.be(undefined);
                        } else {
                            // browser
                            expect(data["@context"]).not.to.be(undefined);
                            expect(data["@id"]).not.to.be(undefined);
                        }
                    }

                    done();
                });
            });
        });

    });
}));
