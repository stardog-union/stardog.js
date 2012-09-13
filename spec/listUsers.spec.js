var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("List Users Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});


	it ("should return a list of current registered users in the system.", function (done) {

		conn.listUsers(function (data, response) {
			expect(response.statusCode).toBe(200);

			expect(data.users).toBeDefined();
			expect(data.users).not.toBeNull();
			expect(data.users.length).toBeGreaterThan(0);
			expect(data.users).toContain('admin');

			done();
		});
	});
});