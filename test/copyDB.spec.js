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

    describe ("Copy DBs Test Suite", function() {
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

        it ("should not copy an online DB", function(done) {
            
            conn.dropDB({ database: "nodeDBCopy" }, function () {

                conn.copyDB({ dbsource: "nodeDB", dbtarget: "nodeDBCopy"}, function () {
                    
                    conn.listDBs(function (data) {

                        expect(data.databases).to.not.contain("nodeDBCopy");
                        expect(data.databases).to.contain("nodeDB");
                        done();
                    });

                });
            });
        });

        it("should copy an offline DB", function(done) {

            conn.dropDB({ database: "nodeDBCopy" }, function () {
                // drop if exists
                
                conn.offlineDB({ database: "nodeDB", strategy: "WAIT", timeout: 3 }, function () {

                    // Once the DB is offline, copy it.
                    conn.copyDB({ dbsource: "nodeDB", dbtarget: "nodeDBCopy" }, function () {
                        
                        conn.listDBs( function (data) {

                            expect(data.databases).to.contain("nodeDBCopy");
                            expect(data.databases).to.contain("nodeDB");
                            
                            // set database online again and drop copied DB.
                            conn.onlineDB({ database: "nodeDB" }, function (data, response1) {
                                expect(response1.statusCode).to.be(200);
                                
                                conn.dropDB({ database: "nodeDBCopy" }, function (data, response2) {
                                    expect(response2.statusCode).to.be(200);

                                    done();
                                });
                            });
                        });

                    });
                });
            });
        });

    });
}));
