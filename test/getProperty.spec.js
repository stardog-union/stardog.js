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
    // Describes the getProperty test methods
    // -----------------------------------

    describe ("Querying properties from individuals", function() {
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

        it ("Gets a specific property from the database", function(done) {
            conn.onlineDB({ database: "nodeDB" }, function () {
                // put online if it"s not

                conn.getProperty(
                    { 
                        database: "nodeDB",
                        uri: "<http://localhost/publications/articles/Journal1/1940/Article1>",
                        property: "<http://localhost/vocabulary/bench/cdrom>"
                    }, 
                    function (response) {
                        // console.log(response);
                        expect(response).not.to.be(undefined);
                        expect(response).not.to.be(null);

                        expect(response).to.be("http://www.hogfishes.tld/richer/succories.html");
                        done();
                    }
                );
            });
        });

    });
}));
