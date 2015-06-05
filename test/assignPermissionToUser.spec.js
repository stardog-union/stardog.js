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

    describe ("Assign Permissions to Users Test Suite", function() {
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

        it ("should fail trying to assign a permssion to a non-existent user.", function (done) {

            var aNewPermission = {
                "action" : "write",
                "resource_type" : "db",
                "resource" : ["nodeDB"]
            };

            conn.assignPermissionToUser({ user: "myuser", permissionObj: aNewPermission }, function (data, response) {
                expect(response.statusCode).to.be(404);
                done();
            });
        });

        it ("should pass assinging a Permissions to a new user.", function (done) {

            var aNewUser = "newpermuser",
                aNewUserPwd = aNewUser,
                aNewPermission = {
                    "action" : "write",
                    "resource_type" : "db",
                    "resource" : ["nodeDB"]
                };

            conn.deleteUser({ user: aNewUser }, function () {
                // delete user if exists

                conn.createUser({ username: aNewUser, password: aNewUserPwd, superuser: true }, function (data, response1) {
                    expect(response1.statusCode).to.be(201);

                    conn.assignPermissionToUser({ user: aNewUser, permissionObj: aNewPermission }, function (data, response2) {

                        expect(response2.statusCode).to.be(201);

                        // delete role
                        conn.deleteUser({ user: aNewUser }, function (data, response3) {
                            expect(response3.statusCode).to.be(200);
                            done();
                        });
                    });
                });
            });
        });
    });
}));
