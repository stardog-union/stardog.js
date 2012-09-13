var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("List Roles Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});


	it ("should return a list of current registered roles in the system.", function (done) {

		conn.listRoles(function (data, response) {
			expect(response.statusCode).toBe(200);

			expect(data.roles).toBeDefined();
			expect(data.roles).not.toBeNull();
			expect(data.roles.length).toBeGreaterThan(0);
			expect(data.roles).toContain('reader');

			done();
		});
	});
});