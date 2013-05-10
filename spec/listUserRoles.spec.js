var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("List user roles Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should return NOT_FOUND if trying to list roles from non-existent user", function (done) {
		conn.listUserRoles({ user: 'someuser' }, function (data, response) {
			expect(response.statusCode).toBe(404);
			done();
		});
	});

	it ("should return a non-empty list with the roles of the user", function (done) {
		conn.listUserRoles({ user: "anonymous" }, function (data, response) {
			expect(response.statusCode).toBe(200);

			expect(data.roles).toBeDefined();
			expect(data.roles).not.toBeNull();
			expect(data.roles.length).toBeGreaterThan(0);
			expect(data.roles).toContain('reader');

			done();
		});
	});

});