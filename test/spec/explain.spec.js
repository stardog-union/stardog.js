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
	// Describes the explain test methods
	// -----------------------------------

	describe ("Getting the query plan of a Query", function() {
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

		self.it ("A response with the query plan should not be empty", function(done) {
			conn.onlineDB({ database: 'nodeDB' }, function (data3, response3) {
				// put online if it's not

				conn.queryExplain({ database: "nodeDB", query: "select ?s where { ?s ?p ?o } limit 10" }, function (data, response) {
					expect(data).toBeDefined();
					expect(data).not.toBe(null);
					expect(data).toBe("Slice(offset=0, limit=10)\n  Projection(s)\n    Scan(subject='s', predicate='p', object='o')\n");
					done();
				});
			});
		});

	});

    // Just return a value to define the module export.
    return {};
}));
