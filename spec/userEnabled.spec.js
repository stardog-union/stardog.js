var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("Enable Users Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should return NOT_FOUND trying to enable a non-existent user.", function (done) {

		conn.userEnabled({ user: 'someuser', enableFlag: true }, function (data, response) {
			expect(response.statusCode).toBe(404);

			done();
		});
	});


	it ("should enable a user recently created.", function (done) {
		// create a new user (this is supposed to change in a future version of the API)

		conn.createUser({ username: 'newuser', password: 'newuser', superuser: true }, function (data1, response1) {

			// It should be 201 (CREATED)
			expect(response1.statusCode).toBe(201);

			// Once created then lets delete it.
			conn.userEnabled({ user: 'newuser', enableFlag: true }, function (data2, response2) {

				expect(response2.statusCode).toBe(200);

				conn.isUserEnabled({ user: 'newuser' }, function (data3, response3) {
					expect(response3.statusCode).toBe(200);

					expect(data3.enabled).toBeDefined();
					expect(data3.enabled).toBe(true);

					// delete the created user.
					conn.deleteUser({ user: 'newuser' }, function (data4, response4) {

						expect(response4.statusCode).toBe(200);

						done();
					});
				})
			});
		});
	});
});