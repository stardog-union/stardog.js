var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("Delete Roles Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});


	it ("should return NOT_FOUND trying to delete a non-existent role.", function (done) {
		conn.deleteRole('no-writer', function (data, response) {
			expect(response.statusCode).toBe(404);

			done();
		});
	});

	it ("should delete a 'writer' role recently created.", function (done) {
		// create a new user (this is supposed to change in a future version of the API)

		conn.createRole('writer', function (data1, response1) {

			// It should be 201 (CREATED)
			expect(response1.statusCode).toBe(201);

			// Once created then lets delete it.
			conn.deleteRole('writer', function (data2, response2) {

				expect(response2.statusCode).toBe(200);

				done();
			});
		});
	});
});