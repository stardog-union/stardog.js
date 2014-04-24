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

    describe ("List User effective permissions Test Suite", function() {
        var conn;

        this.timeout(0);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
        });

        afterEach(function() {
            conn = null;
        });

        it ("should fail trying to get the list of effective permissions of a non-existent user.", function (done) {

            conn.listUserEffPermissions({ user: "myuser" }, function (data, response) {
                expect(response.statusCode).to.be(404);
                done();
            });
        });

        it ("should list effective permissions assigned to a new user.", function (done) {
            var aNewUser = "newtestuser",
                aNewUserPwd = aNewUser,
                aNewPermission = {
                    "action" : "write",
                    "resource_type" : "db",
                    "resource" : "nodeDB"
                };

            // delete user
            conn.deleteUser({ user: aNewUser }, function () {
                
                conn.createUser({ username: aNewUser, password: aNewUserPwd, superuser: true }, function (data1, response1) {
                    expect(response1.statusCode).to.be(201);

                    conn.assignPermissionToUser({ user: aNewUser, permissionObj: aNewPermission }, function (data2, response2) {
                        expect(response2.statusCode).to.be(201);

                        // list permissions to new role should include recently added.
                        conn.listUserEffPermissions({ user: aNewUser }, function (data3, response3) {

                            expect(data3.permissions).not.to.be(undefined);
                            expect(data3.permissions).not.to.be(null);
                            expect(data3.permissions).to.contain("stardog:*:*:*");

                            // delete user
                            conn.deleteUser({ user: aNewUser }, function () {
                                expect(response3.statusCode).to.be(200);

                                done();
                            });

                        });
                    });
                });
            });
        });
    });

}));
