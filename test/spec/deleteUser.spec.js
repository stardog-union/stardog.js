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

	describe ("Delete Users Test Suite", function() {
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


		it ("should return NOT_FOUND trying to delete a non-existent user.", function (done) {
			conn.deleteUser({ user: 'someuser' }, function (data, response) {
				expect(response.statusCode).toBe(404);

				if (done) { // node.js
					done() 
				}
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

		it ("should delete a supplied user recently created.", function (done) {
			// create a new user (this is supposed to change in a future version of the API)

			conn.createUser({ username: 'newuser', password: 'newuser', superuser: true }, function (data, response) {

				// It should be 201 (CREATED)
				expect(response.statusCode).toBe(201);

				// Once created then lets delete it.
				conn.deleteUser({ user: 'newuser' }, function (data, response) {

					expect(response.statusCode).toBe(200);

					if (done) { // node.js
						done() 
					}
				});
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});
	});

    // Just return a value to define the module export.
    return {};
}));
