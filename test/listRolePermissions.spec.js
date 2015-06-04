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

    describe ("List Role permissions Test Suite", function() {
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

        it ("should fail trying to get the list of permissions of a non-existent role.", function (done) {

            conn.listRolePermissions({ role: "myrole" }, function (data, response) {
                expect(response.statusCode).to.be(404);
                done();
            });
        });

        it ("should list permissions assigned to a new role.", function (done) {
            var aNewRole = "newtestrole";
            var aNewPermission = {
                "action" : "write",
                "resource_type" : "db",
                "resource" : ["nodeDB"]
            };

            conn.createRole({ rolename: aNewRole }, function (data1, response1) {
                expect(response1.statusCode).to.be(201);

                conn.assignPermissionToRole({ role: aNewRole, permissionObj: aNewPermission }, function (data2, response2) {

                    expect(response2.statusCode).to.be(201);

                    // list permissions to new role should include recently added.
                    conn.listRolePermissions({ role: aNewRole }, function (data3, response3) {
                        expect(response3.statusCode).to.be(200);

                        expect(data3.permissions).not.to.be(undefined);
                        expect(data3.permissions).not.to.be(null);
                        expect(data3.permissions.length).to.be.above(0);
                        expect(data3.permissions[0].resource).to.contain("nodeDB");

                        // delete role
                        conn.deleteRole({ role: aNewRole }, function () {
                            expect(response3.statusCode).to.be(200);

                            done();
                        });

                    });
                });
            });
        });
    });
}));
