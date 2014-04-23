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

	describe ("List user roles Test Suite", function() {
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

		self.it ("should return NOT_FOUND if trying to list roles from non-existent user", function (done) {
			conn.listUserRoles({ user: 'someuser' }, function (data, response) {
				expect(response.statusCode).toBe(404);
				done();
			});
		});

		self.it ("should return a non-empty list with the roles of the user", function (done) {
			conn.listUserRoles({ user: "anonymous" }, function (data, response) {
				expect(response.statusCode).toBe(200);

				expect(data.roles).toBeDefined();
				expect(data.roles).not.toBeNull();
				expect(data.roles.length).toBeGreaterThan(0);
				expect(data.roles).toContain('reader');

				done();
			});
		});

	});

    // Just return a value to define the module export.
    return {};
}));
