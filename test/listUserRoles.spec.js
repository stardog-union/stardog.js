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

    describe ("List user roles Test Suite", function() {
        var conn;

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
        });

        afterEach(function() {
            conn = null;
        });

        it ("should return NOT_FOUND if trying to list roles from non-existent user", function (done) {
            conn.listUserRoles({ user: "someuser" }, function (data, response) {
                expect(response.statusCode).to.be(404);
                done();
            });
        });

        it ("should return a non-empty list with the roles of the user", function (done) {
            conn.createRole({ rolename: "nodeDBRole" }, function () {
              conn.setUserRoles({user: "anonymous", roles: ["nodeDBRole"] }, function () {
                conn.listUserRoles({ user: "anonymous" }, function (data, response) {
                    expect(response.statusCode).to.be(200);

                    expect(data.roles).not.to.be(undefined);
                    expect(data.roles).not.to.be(null);
                    expect(data.roles.length).to.be.above(0);
                    expect(data.roles).to.contain("nodeDBRole");

                    conn.deleteRole({role: "nodeDBRole"}, function () {
                      done();
                    });
                });
              });
            });
        });

    });
}));
