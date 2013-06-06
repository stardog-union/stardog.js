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

	describe ("Enable Users Test Suite", function() {
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

		it ("should return NOT_FOUND trying to enable a non-existent user.", function (done) {

			conn.userEnabled({ user: 'someuser', enableFlag: true }, function (data, response) {
				expect(response.statusCode).toBe(404);

				if (done) { // node.js
					done() 
				}
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

		it ("should enable a user recently created.", function (done) {
			// create a new user (this is supposed to change in a future version of the API)

			// delete the created user.
			conn.deleteUser({ user: 'newuser' }, function (data4, response4) {

				conn.createUser({ username: 'newuser', password: 'newuser', superuser: true }, function (data1, response1) {

					// It should be 201 (CREATED)
					expect(response1.statusCode).toBe(201);

					// Once created then lets delete it.
					conn.userEnabled({ user: 'newuser', enableFlag: true }, function (data2, response2) {

						expect(response2.statusCode).toBe(200);

						conn.isUserEnabled({ user: 'newuser' }, function (data3, response3) {
							expect(response3.statusCode).toBe(200);

							expect(data3.enabled).toBeDefined();
							expect(data3.enabled).toBe(true);

							// delete the created user.
							conn.deleteUser({ user: 'newuser' }, function (data4, response4) {

								expect(response4.statusCode).toBe(200);

								if (done) { // node.js
									done() 
								}
							});
						})
					});
				});
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});
	});

	// Just return a value to define the module export.
	return {};
}));
