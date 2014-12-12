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

    describe ("Enable Users Test Suite", function() {
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

        it("should return NOT_FOUND trying to enable a non-existent user.", function (done) {

            conn.userEnabled({ user: "someuser", enableFlag: true }, function (data, response) {
                expect(response.statusCode).to.be(404);

                done();
            });
        });

        it("should enable a user recently created.", function (done) {
            // create a new user (this is supposed to change in a future version of the API)

            // delete the created user.
            conn.deleteUser({ user: "newuser" }, function () {

                conn.createUser({ username: "newuser", password: "newuser", superuser: true }, function (data1, response1) {

                    // It should be 201 (CREATED)
                    expect(response1.statusCode).to.be(201);

                    // Once created then lets delete it.
                    conn.userEnabled({ user: "newuser", enableFlag: true }, function (data2, response2) {

                        expect(response2.statusCode).to.be(200);

                        conn.isUserEnabled({ user: "newuser" }, function (data3, response3) {
                            expect(response3.statusCode).to.be(200);

                            expect(data3.enabled).not.to.be(undefined);
                            expect(data3.enabled).to.be(true);

                            // delete the created user.
                            conn.deleteUser({ user: "newuser" }, function (data4, response4) {

                                expect(response4.statusCode).to.be(200);

                                done();
                            });
                        });
                    });
                });
            });
        });
    });
}));
