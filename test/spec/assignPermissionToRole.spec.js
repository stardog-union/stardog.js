(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('../../js/stardog.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stardog'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog);
    }
}(this, function (Stardog) {

	describe ("Assign Permissions to Roles Test Suite", function() {
		var conn;

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5822/");
			conn.setCredentials("admin", "admin");
		});

		afterEach(function() {
			conn = null;
		});

		it ("should fail trying to assign a permssion to a non-existent role.", function (done) {

			var aNewPermission = {
				'action' : 'write',
				'resource_type' : 'db',
				'resource' : 'nodeDB'
			};

			conn.assignPermissionToRole({ role: 'myrole', permissionObj: aNewPermission }, function (data, response) {

				expect(response.statusCode).toBe(404);
				done();
			});

		});

		it ("should pass assinging a Permissions to a new role.", function (done) {

			var aNewRole = 'newtestrole';
			var aNewPermission = {
				'action' : 'write',
				'resource_type' : 'db',
				'resource' : 'nodeDB'
			};

			conn.createRole({ rolename: aNewRole }, function (data, response1) {
				expect(response1.statusCode).toBe(201);

				conn.assignPermissionToRole({ role: aNewRole, permissionObj: aNewPermission }, function (data, response2) {

					expect(response2.statusCode).toBe(201);

					// delete role
					conn.deleteRole({ role: aNewRole }, function (data, response3) {
						expect(response3.statusCode).toBe(200);

						done();
					});
				});
			});
		});
	});

    // Just return a value to define the module export.
    return {};
}));
