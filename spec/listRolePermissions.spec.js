var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("List Role permissions Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});


	it ("should fail trying to get the list of permissions of a non-existent role.", function (done) {

		conn.listRolePermissions({ role: 'myrole' }, function (data, response) {
			expect(response.statusCode).toBe(404);
			done();
		});
	});

	it ("should list permissions assigned to a new role.", function (done) {
		var aNewRole = 'newtestrole';
		var aNewPermission = {
			'action' : 'write',
			'resource_type' : 'db',
			'resource' : 'nodeDB'
		};

		conn.createRole({ rolename: aNewRole }, function (data1, response1) {
			expect(response1.statusCode).toBe(201);

			conn.assignPermissionToRole({ role: aNewRole, permissionObj: aNewPermission }, function (data2, response2) {

				expect(response2.statusCode).toBe(201);

				// list permissions to new role should include recently added.
				conn.listRolePermissions({ role: aNewRole }, function (data3, response3) {
					expect(response3.statusCode).toBe(200);

					expect(data3.permissions).toBeDefined();
					expect(data3.permissions).not.toBeNull();
					expect(data3.permissions).toContain('stardog:write:db:nodeDB');

					// delete role
					conn.deleteRole({ role: aNewRole }, function (data, response) {
						expect(response3.statusCode).toBe(200);

						done();
					});

				});
			});
		});
	});
});