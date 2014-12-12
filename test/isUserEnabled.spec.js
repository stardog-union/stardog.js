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
    // Describes the user enabled test methods
    // -----------------------------------

    describe ("Check if user is enabled Test Suite", function() {
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

        it ("should get NOT_FOUND for a non-existent user", function (done) {

            conn.isUserEnabled({ user: "someuser" }, function (data, response) {
                expect(response.statusCode).to.be(404);
                done();
            });
        });

        it ("should return the value with the user's enabled flag", function (done) {
            conn.onlineDB({ database: "nodeDB" }, function () {
                // put online if it"s not
                
                conn.isUserEnabled({ user: "admin" }, function (data, response) {
                    expect(response.statusCode).to.be(200);
                    expect(data.enabled).to.be(true);
                    done();
                });
            });
        });

    });
}));
