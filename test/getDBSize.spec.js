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
    // Describes the getDBSize test methods
    // -----------------------------------

    describe ("Getting the size of the DB", function() {
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

        it ("A response with the size of the DB should not be empty", function(done) {
            conn.onlineDB({ database: "nodeDB" }, function () {
                // put online if it"s not

                conn.getDBSize({ database: "nodeDB" }, function (response) {
                    // console.log(response);
                    expect(response).not.to.be(undefined);
                    expect(response).not.to.be(null);

                    var sizeNum = parseInt(response);
                    expect(sizeNum).to.be.above(0);
                    done();
                });
                
            });
        });

    });
}));
