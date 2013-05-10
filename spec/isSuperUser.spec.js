var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the listDB test methods
// -----------------------------------

describe ("Check if user is superuser Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should get NOT_FOUND for a non-existent user", function (done) {

		conn.isSuperUser({ user: 'someuser' }, function (data, response) {
			expect(response.statusCode).toBe(404);
			done();
		});
	});

	it ("should return the value with the user's superuser flag", function (done) {

		conn.isSuperUser({ user: 'admin' }, function (data, response) {
			expect(response.statusCode).toBe(200);
			expect(data.superuser).toBe(true);

			done();
		});
	});

});