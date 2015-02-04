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
    // Describes the listDB test methods
    // -----------------------------------

    describe ("Drop DBs Test Suite", function() {
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

        it ("should not drop an non-existent DB", function (done) {
            
            conn.dropDB({ database: "nodeDBDrop" }, function (data, response) {
                expect(response.statusCode).to.be(404);

                expect(data).to.contain("does not exist");
                done();
            });
        });

        it ("should drop a just created database", function (done) {
            this.timeout(50000);

            conn.offlineDB({ database: "nodeDB", strategy: "WAIT", timeout: 1 }, function (data2, response2) {
                expect(response2.statusCode).to.be(200);

                conn.copyDB({ dbsource: "nodeDB", dbtarget: "nodeDBDrop" }, function (data3, response3) {
                    expect(response3.statusCode).to.be(200);

                    // Clean just created DB.
                    conn.dropDB({ database: "nodeDBDrop" }, function (data4, response4) {
                        expect(response4.statusCode).to.be(200);

                        // set nodeDB back online
                        conn.onlineDB( { database: "nodeDB", strategy: "NO_WAIT" }, function (data5, response5) {
                            expect(response5.statusCode).to.be(200);

                            done();
                        });
                    });
                });
            });
        });

    });
}));
