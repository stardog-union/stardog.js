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
    // Describes the query test methods
    // -----------------------------------

    describe ("Query a DB with GROUP_CONCAT.", function() {
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

        it ("should execute a query with without errors, receiving 200 status code: Q1", function (done) {
          var queryStr = 'select ?s (Group_Concat(?o ; separator=",") as ?o_s) where { ?s <#name> ?o } group by ?s';

          conn.onlineDB({ database: "nodeDB", strategy: "NO_WAIT" }, function () {

              conn.query({
                  database: "nodeDB",
                  query: queryStr
              }, function (data, response) {
                  // console.log("Status code: "+ response.statusCode);

                  expect(response).not.to.be(undefined);
                  expect(response.statusCode).not.to.be(null);
                  expect(response.statusCode).not.to.be(undefined);
                  expect(response.statusCode).to.be(200);

                  // console.log("Data: "+ JSON.stringify(data));
                  expect(data).not.to.be(null);
                  expect(data.results).not.to.be(undefined);
                  expect(data.results.bindings).not.to.be(undefined);
                  done();
              });
          });
        });
    });
}));
