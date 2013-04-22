var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the listDB test methods
// -----------------------------------

describe ("Change User Password Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should fail trying to change a password (char[]) from an non-existent user", function (done) {

		conn.changePwd("someuser", 'somepwd', function (data, response) {
			expect(response.statusCode).toBe(404);
			done();
		});
	});

	it ("should change the password and allow calls with new credentials", function (done) {

		conn.createUser('newuser', 'newuser', true, function (data, response) {

			// It should be 201 (CREATED)
			expect(response.statusCode).toBe(201);

			conn.changePwd('newuser', 'somepwd', function (data1, response1) {
				expect(response1.statusCode).toBe(200);

				// update conn with new credentials
				conn.setCredentials('newuser', 'somepwd');

				// call to list DBs should be able to be done.
				conn.listDBs(function (data2, response2) {
					expect(response2.statusCode).toBe(200);
					expect(data2.databases).toBeDefined();

					// delete user.
					conn.deleteUser('newuser', function (data3, response3) {

						expect(response3.statusCode).toBe(200);

						done();
					});
				});
			});
		});
	});

});