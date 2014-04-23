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

	describe ("List Roles Test Suite", function() {
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
		
		self.it ("should return a list of current registered roles in the system.", function (done) {

			conn.listRoles(function (data, response) {
				// console.log("data:", data, "response:", response);
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
