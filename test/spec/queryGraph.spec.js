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
	// Describes the queryGraph test methods
	// -----------------------------------

	describe ("Query a DB receiving a Graph in JSON-LD", function() {
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

		it ("A graph query for ALL result should not be empty", function(done) {
			
			conn.queryGraph({ database: "nodeDB", query: "describe ?s" }, function (data) {
				// console.log(data);

				expect(data).toBeDefined();
				expect(data).not.toBe(null);

				// Could be an array of JSON-LD objects
				if (data instanceof Array) {
					for (var i=0; i < data.length; i++) {
						expect(data[i].get('@id')).toBeDefined();
						//expect(data[i].get('@type')).toBeDefined();
					}
				}
				else {
					expect(data.get('@context')).toBeDefined();
				}

				if (done) { // node.js
					done() 
				}
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

		it ("A graph query could be limited too", function(done) {
			
			conn.queryGraph({ database: "nodeDB", query: "describe ?s", limit: 1 }, function (data) {
				// console.log(data);

				expect(data).toBeDefined();
				expect(data).not.toBe(null);

				// Could be an array of JSON-LD objects
				if (data instanceof Array) {
					for (var i=0; i < data.length; i++) {
						expect(data[i].get('@id')).toBeDefined();
					}
				}
				else {
					// At leat must have the context and an id.
					expect(data.get('@context')).toBeDefined();
					expect(data.get('@id')).toBeDefined();
				}

				if (done) { // node.js
					done() 
				}
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

	});

    // Just return a value to define the module export.
    return {};
}));
