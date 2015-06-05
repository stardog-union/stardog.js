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

    describe ("Delete Permissions to Roles Test Suite", function() {
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

        it ("should fail trying to delete a permssion from a non-existent role.", function (done) {

            var aNewPermission = {
                "action" : "write",
                "resource_type" : "db",
                "resource" : ["nodeDB"]
            };

            conn.deletePermissionFromRole({ role: "myrole", permissionObj: aNewPermission }, function (data, response) {

                expect(response.statusCode).to.be(404);
                done();
            });
        });

        it ("should pass deleting Permissions from a new role.", function (done) {

            var aNewRole = "newtestrole";
            var aNewPermission = {
                "action" : "write",
                "resource_type" : "db",
                "resource" : ["nodeDB"]
            };

            conn.deletePermissionFromRole({ role: aNewRole, permissionObj: aNewPermission }, function () {
                // delete if exists
                conn.deleteRole({ role: aNewRole }, function () {
                    // delete if exists

                    conn.createRole({ rolename: aNewRole }, function (data1, response1) {
                        expect(response1.statusCode).to.be(201);

                        // Add permissions to role
                        conn.assignPermissionToRole({ role: aNewRole, permissionObj: aNewPermission }, function (data2, response2) {
                            expect(response2.statusCode).to.be(201);

                            conn.deletePermissionFromRole({ role: aNewRole, permissionObj: aNewPermission }, function (data3, response3) {
                                expect(response3.statusCode).to.be(200);

                                // delete role
                                conn.deleteRole({ role: aNewRole }, function (data4, response4) {
                                    expect(response4.statusCode).to.be(200);
                                    done();
                                });
                            });

                        });
                    });
                });

            });
        });
    });
}));
