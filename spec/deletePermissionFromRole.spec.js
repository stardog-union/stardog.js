var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("Delete Permissions to Roles Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should fail trying to delete a permssion to a non-existent role.", function (done) {

		var aNewPermission = {
			'action' : 'write',
			'resource_type' : 'db',
			'resource' : 'nodeDB'
		};

		conn.deletePermissionFromRole('myrole', aNewPermission, function (data, response) {

			expect(response.statusCode).toBe(404);
			done();
		});

	});

	it ("should pass deleting Permissions to a new role.", function (done) {

		var aNewRole = 'newtestrole';
		var aNewPermission = {
			'action' : 'write',
			'resource_type' : 'db',
			'resource' : 'nodeDB'
		};

		conn.createRole(aNewRole, function (data, response1) {
			expect(response1.statusCode).toBe(201);

			conn.deletePermissionFromRole(aNewRole, aNewPermission, function (data, response2) {

				expect(response2.statusCode).toBe(200);

				// delete role
				conn.deleteRole(aNewRole, function (data, response3) {
					expect(response3.statusCode).toBe(200);

					done();
				});
			});
		});
	});
});