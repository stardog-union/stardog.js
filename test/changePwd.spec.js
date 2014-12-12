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
    // Describes the listDB test methods
    // -----------------------------------

    describe ("Change User Password Test Suite", function() {
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

        it ("should fail trying to change a password (char[]) from an non-existent user", function (done) {

            conn.changePwd({ user: "someuser", newPwd: "somepwd" }, function (data, response) {
                expect(response.statusCode).to.be(404);
                done();
            });
        });

        it ("should change the password and allow calls with new credentials", function (done) {

            conn.deleteUser({ user: "newuser" }, function () {
                // delete user if it exists
            
                conn.createUser({ username: "newuser", password: "newuser", superuser: true }, function (data, response) {
                    // It should be 201 (CREATED)
                    expect(response.statusCode).to.be(201);

                    conn.changePwd({ user: "newuser", newPwd: "somepwd" }, function (data1, response1) {
                        expect(response1.statusCode).to.be(200);
                        conn.setCredentials("admin","admin");

                        // update conn with new credentials
                        conn.setCredentials("newuser", "somepwd");

                        // call to list DBs should be able to be done.
                        conn.listDBs(function (data2, response2) {
                            expect(response2.statusCode).to.be(200);
                            expect(data2.databases).not.to.be(undefined);

                            // delete user.
                            conn.deleteUser({ user: "newuser" }, function (data3, response3) {

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
