// -----------------------------------
// Describes the listDB test methods
// -----------------------------------

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

    describe ("Listing DBs Test Suite", function() {
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

        it ("should not be empty", function(done) {
            conn.listDBs(function (data) {
                // console.log("data:", data, "response:", response);
                expect(data).not.to.be(null);
                expect(data.databases).not.to.be(undefined);
                expect(data.databases).not.to.be(null);
                expect(data.databases.length).not.to.be.below(0);
                done();
            });
        });

        it ("should contain nodeDB db (previously loaded)", function(done) {
            conn.listDBs(function (data) {
                expect(data.databases).to.contain("nodeDB");
                done();
            });
        });
    });

}));
