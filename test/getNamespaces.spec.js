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
    // Gets DB Options
    // -----------------------------------

    describe ("Get DB Namespaces Test Suite", function() {
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

        it ("should throw an Error when the database option was not passed in the options object.", function () {
            var noop = function () {};
            expect(conn.getNamespaces).to.throwError(/Option `database` is required/);
            expect(conn.getNamespaces).withArgs({},noop).to.throwError(/Option `database` is required/);
        });

        it ("should retrieve the namespace prefix bindings for the database", function (done) {
            conn.getNamespaces({
                database: "nodeDB"
            }, function (data, response) {
                expect(response.statusCode).to.be(200);

                expect(data).not.to.be(undefined);
                expect(data).not.to.be(null);
                expect(data instanceof Object).to.be(true);
                expect(Object.keys(data).length).to.be(5);

                done();
            });
        });

    });
}));
