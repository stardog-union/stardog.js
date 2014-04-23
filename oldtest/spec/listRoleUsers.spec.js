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

	describe ("List Users with role Test Suite", function() {
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


		self.it ("should return a list of users assigned to the 'reader' role in the system.", function (done) {

			conn.listRoleUsers({ role: "reader" }, function (data, response) {
				expect(response.statusCode).toBe(200);

				expect(data.users).toBeDefined();
				expect(data.users).not.toBeNull();
				expect(data.users.length).toBeGreaterThan(0);
				expect(data.users).toContain('anonymous');

				done();
			});
		});
	});

    // Just return a value to define the module export.
    return {};
}));
