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
	// Describes the listDB test methods
	// -----------------------------------

	describe ("Listing DBs Test Suite", function() {
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

		self.it ("should not be empty", function(done) {
			
			conn.listDBs(function (data, response) {
				// console.log("data:", data, "response:", response);
				expect(data).not.toBe(null);
				expect(data.databases).toBeDefined();
				expect(data.databases).not.toBeNull();
				expect(data.databases.length).not.toBeLessThan(0);
				done();
			});
		});

		self.it ("should contain nodeDB db (previously loaded)", function(done) {
			
			conn.listDBs(function (data) {
				expect(data.databases).toContain('nodeDB');
				done();
			});
		});

	});

    // Just return a value to define the module export.
    return {};
}));
