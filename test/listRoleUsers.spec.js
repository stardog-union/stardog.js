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

    describe ("List Users with role Test Suite", function() {
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

        it ("should return a list of users assigned to the 'reader' role in the system.", function (done) {
          conn.createRole({ rolename: "nodeDBRole" }, function () {
            conn.setUserRoles({user: "anonymous", roles: ["nodeDBRole"] }, function () {
              conn.listRoleUsers({ role: "nodeDBRole" }, function (data, response) {
                  expect(response.statusCode).to.be(200);

                  expect(data.users).not.to.be(undefined);
                  expect(data.users).not.to.be(null);
                  expect(data.users.length).to.be.above(0);
                  expect(data.users).to.contain("anonymous");

                  conn.deleteRole({role: "nodeDBRole"}, function () {
                    done();
                  });
              });
            });
          });
        });
    });
}));
