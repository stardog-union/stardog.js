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

    describe ("Create a new DB Test Suite", function() {
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

        it ("should not be able to create a new db with the name of an existing DB", function (done) {
            var options = {
                "database" : "nodeDB",
                "options" : { "index.type" : "disk" },
                "files": []
            };

            conn.createDB(options, function (data, response) {
                expect(response.statusCode).to.be(409);

                done();
            });
        });

        it ("should create a new empty DB, returning 201", function (done) {

            var options = {
                "database" : "nodeDB2",
                "options" : { "search.enabled" : true },
                "files" : []
            };

            // filesArr.push({
            //  "name" : "api_tests.nt"
            // });
            
            conn.createDB(options, function (data, response) {
                expect(response.statusCode).to.be(201);
                // console.log(data);

                if (response.statusCode == 201) {
                    // clean created DB after we know it was created
                    conn.dropDB({ database: "nodeDB2" }, function (data2, response2) {
                        expect(response2.statusCode).to.be(200);

                        done();
                    });
                }
            });

        });

        // it ("should create a new DB with data, returning 201", function (done) {
        //  var options = {
        //      "search.enabled" : true
        //  };

        //  var filesArr = [];
        //  filesArr.push({
        //      "name" : "api_tests.nt"
        //  });
            
        //  conn.createDB("newNodeDB", options, filesArr, function (data, response) {
        //      expect(response.statusCode).toBe(201);
        //      console.log(data);

        //      if (response.statusCode === 201) {
        //          conn.dropDB("newNodeDB", function (data2, response2) {
        //              expect(response2.statusCode).toBe(200);

        //              done();
        //          });
        //      }
        //      else {
        //          // console.log(data);
        //          done();
        //      }
        //  }, "data/api_tests.nt");

        // });

    });
}));