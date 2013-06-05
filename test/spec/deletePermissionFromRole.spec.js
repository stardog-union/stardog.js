(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('../../js/stardog.js'), require('../lib/async.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stardog', 'async'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog, async);
    }
}(this, function (Stardog, Async) {

	describe ("Delete Permissions to Roles Test Suite", function() {
		var conn,
			checkDone = (new Async()).done;

		beforeEach(function() {
			conn = new Stardog.Connection();
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

			conn.deletePermissionFromRole({ role: 'myrole', permissionObj: aNewPermission }, function (data, response) {

				expect(response.statusCode).toBe(404);
				if (done) { // node.js
					done() 
				}
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

		it ("should pass deleting Permissions to a new role.", function (done) {

			var aNewRole = 'newtestrole';
			var aNewPermission = {
				'action' : 'write',
				'resource_type' : 'db',
				'resource' : 'nodeDB'
			};

			conn.createRole({ rolename: aNewRole }, function (data1, response1) {
				expect(response1.statusCode).toBe(201);

				// Add permissions to role
				conn.assignPermissionToRole({ role: aNewRole, permissionObj: aNewPermission }, function (data2, response2) {
					expect(response2.statusCode).toBe(201);

					conn.deletePermissionFromRole({ role: aNewRole, permissionObj: aNewPermission }, function (data3, response3) {
						expect(response3.statusCode).toBe(200);

						// delete role
						conn.deleteRole({ role: aNewRole }, function (data4, response4) {
							expect(response4.statusCode).toBe(200);

							if (done) { // node.js
								done() 
							}
						});
					});

				});
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});
	});

    // Just return a value to define the module export.
    return {};
}));
