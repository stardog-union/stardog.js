var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("List Users with role Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});


	it ("should return a list of users assigned to the 'reader' role in the system.", function (done) {

		conn.listRoleUsers({ role: "reader" }, function (data, response) {
			expect(response.statusCode).toBe(200);

			expect(data.users).toBeDefined();
			expect(data.users).not.toBeNull();
			expect(data.users.length).toBeGreaterThan(0);
			expect(data.users).toContain('anonymous');

			done();
		});
	});
});