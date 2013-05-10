var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("Delete Permissions to Users Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should fail trying to delete a permssion to a non-existent user.", function (done) {

		var aNewPermission = {
			'action' : 'write',
			'resource_type' : 'db',
			'resource' : 'nodeDB'
		};

		conn.deletePermissionFromUser({ user: 'myuser', permissionObj: aNewPermission }, function (data, response) {

			expect(response.statusCode).toBe(404);
			done();
		});

	});

	it ("should pass deleting a Permissions to a new user.", function (done) {

		var aNewUser = aNewUserPwd = 'newpermuser';
		var aNewPermission = {
			'action' : 'write',
			'resource_type' : 'db',
			'resource' : 'nodeDB'
		};

		conn.createUser({ username: aNewUser, password: aNewUserPwd, superuser: true }, function (data1, response1) {
			expect(response1.statusCode).toBe(201);

			conn.assignPermissionToUser({ user: aNewUser, permissionObj: aNewPermission }, function (data2, response2) {
				expect(response2.statusCode).toBe(201);

				conn.deletePermissionFromUser({ user: aNewUser, permissionObj: aNewPermission }, function (data3, response3) {
					expect(response3.statusCode).toBe(200);

					// delete role
					conn.deleteUser({ user: aNewUser }, function (data4, response4) {
						expect(response4.statusCode).toBe(200);

						done();
					});
				});
			});
		});
	});
});