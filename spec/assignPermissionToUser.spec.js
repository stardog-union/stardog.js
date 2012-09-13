var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("Assign Permissions to Users Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should fail trying to assign a permssion to a non-existent user.", function (done) {

		var aNewPermission = {
			'action' : 'write',
			'resource_type' : 'db',
			'resource' : 'nodeDB'
		};

		conn.assignPermissionToUser('myuser', aNewPermission, function (data, response) {

			expect(response.statusCode).toBe(404);
			done();
		});

	});

	it ("should pass assinging a Permissions to a new user.", function (done) {

		var aNewUser = 'newpermuser';
		var aNewPermission = {
			'action' : 'write',
			'resource_type' : 'db',
			'resource' : 'nodeDB'
		};

		conn.createUser(aNewUser, true, function (data, response1) {
			expect(response1.statusCode).toBe(201);

			conn.assignPermissionToUser(aNewUser, aNewPermission, function (data, response2) {

				expect(response2.statusCode).toBe(201);

				// delete role
				conn.deleteUser(aNewUser, function (data, response3) {
					expect(response3.statusCode).toBe(200);

					done();
				});
			});
		});
	});
});