var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("List User effective permissions Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});


	it ("should fail trying to get the list of effective permissions of a non-existent user.", function (done) {

		conn.listUserEffPermissions('myuser', function (data, response) {
			expect(response.statusCode).toBe(404);
			done();
		});
	});

	it ("should list effective permissions assigned to a new user.", function (done) {
		var aNewUser = aNewUserPwd = 'newtestuser';
		var aNewPermission = {
			'action' : 'write',
			'resource_type' : 'db',
			'resource' : 'nodeDB'
		};

		conn.createUser(aNewUser, aNewUserPwd, true, function (data1, response1) {
			expect(response1.statusCode).toBe(201);

			conn.assignPermissionToUser(aNewUser, aNewPermission, function (data2, response2) {
				expect(response2.statusCode).toBe(201);

				// list permissions to new role should include recently added.
				conn.listUserEffPermissions(aNewUser, function (data3, response3) {

					expect(data3.permissions).toBeDefined();
					expect(data3.permissions).not.toBeNull();
					expect(data3.permissions).toContain('stardog:*:*:*');

					// delete role
					conn.deleteUser(aNewUser, function (data, response) {
						expect(response3.statusCode).toBe(200);

						done();
					});

				});
			});
		});
	});
});