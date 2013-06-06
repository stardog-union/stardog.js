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

	// -----------------------------------
	// Describes the super user test methods
	// -----------------------------------

	describe ("Check if user is superuser Test Suite", function() {
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

		it ("should get NOT_FOUND for a non-existent user", function (done) {

			conn.isSuperUser({ user: 'someuser' }, function (data, response) {
				expect(response.statusCode).toBe(404);
				if (done) { // node.js
					done() 
				}
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

		it ("should return the value with the user's superuser flag", function (done) {
			conn.onlineDB({ database: 'nodeDB' }, function (data3, response3) {
				// put online if it's not

				conn.isSuperUser({ user: 'admin' }, function (data, response) {
					expect(response.statusCode).toBe(200);
					expect(data.superuser).toBe(true);

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
