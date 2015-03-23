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

    describe ("Optimize DBs Test Suite", function() {
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

        it ("should get NOT_FOUND status code trying to optimize a non-existent DB.", function(done) {

            conn.optimizeDB({ database: "nodeDB_optimize" }, function (data, response) {

                expect(response.statusCode).to.be(404);
                done();
            });
        });

        it ("should optimize an online DB", function(done) {

            // Clean everything
            conn.dropDB({ database: "nodeDB_optimize" }, function () {

                conn.offlineDB({ database: "nodeDB", strategy: "WAIT", timeout: 5 }, function (data, response1) {
                    expect(response1.statusCode).to.be(200);

                    conn.copyDB({ dbsource: "nodeDB", dbtarget: "nodeDB_optimize" }, function (data, response2) {
                        expect(response2.statusCode).to.be(200);

                        conn.onlineDB({ database: "nodeDB_optimize", strategy: "NO_WAIT" }, function (data, response3) {
                            expect(response3.statusCode).to.be(200);

                            conn.optimizeDB({ database: "nodeDB_optimize" }, function (data, response4) {
                                expect(data.message).to.be('nodeDB_optimize was successfully optimized.');
                                expect(response4.statusCode).to.be(200);

                                // Clean everything
                                conn.dropDB({ database: "nodeDB_optimize" }, function (data, response5) {
                                    expect(response5.statusCode).to.be(200);

                                    expect(conn).not.to.be(null);

                                    conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function (data, response6) {
                                        expect(response6.statusCode).to.be(200);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    });
}));
