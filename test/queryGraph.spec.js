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

        this.timeout(50000);

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
            
                conn.queryGraph({ database: "nodeDB", query: "construct where { ?s ?p ?o }" }, function (data) {
                    expect(data).not.to.be(undefined);
                    expect(data).not.to.be(null);

                    // Could be an array of JSON-LD objects
                    expect(data.length).to.be.above(0);
                    expect(data.length).to.be(3);  // three articles defined in nodeDB

                    for (var i=0; i < data.length; i++) {
                        expect(data[i]).not.to.be(undefined);
                        expect(data[i]["@id"]).not.to.be(undefined);
                    }

                    done();
                });

            });
        });

        it("A graph query could be limited too", function(done) {
            conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.queryGraph({ database: "nodeDB", 
                    query: "describe <http://localhost/publications/articles/Journal1/1940/Article1>",
                    limit: 1 }, function (data) {  // retrieve just one triple

                    expect(data).not.to.be(undefined);
                    expect(data).not.to.be(null);

                    // Could be an array of JSON-LD objects
                    if (data instanceof Array) {
                        expect(data).not.to.be(undefined);
                        expect(data).not.to.be(null);

                        // Could be an array of JSON-LD objects
                        expect(data.length).to.be.above(0);
                        expect(data.length).to.be(1);  // three articles defined in nodeDB

                        for (var i=0; i < data.length; i++) {
                            expect(data[i]).not.to.be();
                            expect(data[i]["@id"]).not.to.be(undefined);
                        }
                    }
                    else if (data instanceof Object) {
                        expect(data["@id"]).not.to.be(undefined);
                    }

                    done();
                });
            });
        });

        it("should be able to retrieve one triple in turtle format", function (done) {
            conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.queryGraph({ database: "nodeDB", 
                    query: "describe <http://localhost/publications/articles/Journal1/1940/Article1>",
                    mimetype: "text/turtle",
                    limit: 1 
                }, function (data) {  // retrieve just one triple
                    var tripleTokens;

                    expect(data).not.to.be(undefined);
                    expect(data).not.to.be(null);

                    expect(data).to.contain("<http://localhost/publications/articles/Journal1/1940/Article1>");
                    tripleTokens = data.split(" ");
                    expect(tripleTokens.length).to.be(4);  // 4 including the trailing `.`

                    done();
                });
            });
        });

    });
}));
