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

    describe ("Get info of a running query", function() {
        var conn;

        this.timeout(0);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
            conn.setReasoning("EL");
        });

        afterEach(function() {
            conn = null;
        });
        
        it ("should return 404 trying to get a queryInfo of a non-existent queryId", function (done) {
            conn.queryGet({
                queryId: '1'
            }, function (data, response) {
                expect(data).to.contain('does not exist');
                expect(response.statusCode).to.be(404);
                done();
            });
        });
    });
}));
