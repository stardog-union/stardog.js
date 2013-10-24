(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('../../js/stardog.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stardog', 'async'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog, async);
    }
}(this, function (Stardog, Async) {
	var self = this;

	// -----------------------------------
	// Describes the user enabled test methods
	// -----------------------------------

	describe ("Check if user is enabled Test Suite", function() {
		var conn;

		if (typeof Async !== 'undefined') {
			self = new Async(this);
		}

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5820/");
			conn.setCredentials("admin", "admin");
		});

		afterEach(function() {
			conn = null;
		});

		self.it ("should get NOT_FOUND for a non-existent user", function (done) {

			conn.isUserEnabled({ user: 'someuser' }, function (data, response) {
				expect(response.statusCode).toBe(404);
				done();
			});
		});

		self.it ("should return the value with the user's enabled flag", function (done) {
			conn.onlineDB({ database: 'nodeDB' }, function (data3, response3) {
				// put online if it's not
				
				conn.isUserEnabled({ user: 'admin' }, function (data, response) {
					expect(response.statusCode).toBe(200);
					expect(data.enabled).toBe(true);
					done();
				});
			});
		});

	});

    // Just return a value to define the module export.
    return {};
}));
