var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("Set User Roles Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
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