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

    describe ("List running queries", function() {
        var conn;

        this.timeout(50000);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
            conn.setReasoning(true);
        });

        afterEach(function() {
            conn = null;
        });

        it ("should start a query and list it with the listQueries call.", function (done) {
            conn.queryList(function (data, response) {
                expect(response.statusCode).to.be(200);

                expect(data).not.to.be(undefined);
                expect(data).not.to.be(null);
                expect(data.queries).not.to.be(undefined);
                expect(data.queries).not.to.be(null);
                expect(data.queries instanceof Array).to.be(true);
                expect(data.queries.length).to.be(0);
                done();
            });
        });
    });
}));
