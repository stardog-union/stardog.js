(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('../../js/stardog.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stardog'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog);
    }
}(this, function (Stardog) {

	describe ("Set User Roles Test Suite", function() {
		var conn;

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5822/");
			conn.setCredentials("admin", "admin");
		});

		afterEach(function() {
			conn = null;
		});

		it ("should return NOT_FOUND trying to set roles to a non-existent user.", function (done) {

			conn.setUserRoles({ user: "roletestuser", roles: ["reader"] }, function (data, response) {
				expect(response.statusCode).toBe(404);

				done();
			});
		});

		it ("should assign roles to a newly created user.", function (done) {

			conn.createUser({ username: "roletestuser", password: "roletestuser", superuser: true }, function (data1, response1) {
				expect(response1.statusCode).toBe(201);

				conn.setUserRoles({ user: "roletestuser", roles: ["reader"] }, function (data2, response2) {

					expect(response2.statusCode).toBe(200);

					// clean and delete the user
					conn.deleteUser({ user: "roletestuser" }, function (data, response3) {
						expect(response3.statusCode).toBe(200);

						done();
					});
				});
			});
		});
		
	});

    // Just return a value to define the module export.
    return {};
}));
