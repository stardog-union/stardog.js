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

	describe ("Delete Roles Test Suite", function() {
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


		it ("should return NOT_FOUND trying to delete a non-existent role.", function (done) {
			conn.deleteRole({ role: 'no-writer' }, function (data, response) {
				expect(response.statusCode).toBe(404);

				if (done) { // node.js
					done() 
				}
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

		it ("should delete a 'writer' role recently created.", function (done) {
			// create a new user (this is supposed to change in a future version of the API)

			// delete if exists
			conn.deleteRole({ role: 'writer' }, function (data2, response2) {

				conn.createRole({ rolename: 'writer' }, function (data1, response1) {

					// It should be 201 (CREATED)
					expect(response1.statusCode).toBe(201);

					// Once created then lets delete it.
					conn.deleteRole({ role: 'writer' }, function (data2, response2) {

						expect(response2.statusCode).toBe(200);

						if (done) { // node.js
							done() 
						}
					});
				});
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});
	});

    // Just return a value to define the module export.
    return {};
}));
