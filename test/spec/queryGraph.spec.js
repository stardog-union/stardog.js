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
	// Describes the queryGraph test methods
	// -----------------------------------

	describe ("Query a DB receiving a Graph in JSON-LD", function() {
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

		self.it("A graph query for ALL result should not be empty", function(done) {
			conn.onlineDB({ database: 'nodeDB', strategy: 'NO_WAIT' }, function (data2, response) {
			
				conn.queryGraph({ database: "nodeDB", query: "describe ?s" }, function (data) {
					expect(data).toBeDefined();
					expect(data).not.toBe(null);

					// Could be an array of JSON-LD objects
					if (data instanceof Array) {
						for (var i=0; i < data.length; i++) {
							expect(data[i]).toBeDefined();							
							if (data[i]['attributes']) {
								// node.js
								expect(data[i].get('@id')).toBeDefined();
							} else {
								// browser
								expect(data[i]['@id']).toBeDefined();
							}
						}
					}
					else {
						if (data['attributes']) {
							// node.js
							expect(data.get('@context')).toBeDefined();
						} else {
							// browser
							expect(data['@context']).toBeDefined();
						}
					}

					done();
				});

			});
		}, 10000);

		self.it("A graph query could be limited too", function(done) {
			conn.onlineDB({ database: 'nodeDB', strategy: 'NO_WAIT' }, function (data2, response) {

				conn.queryGraph({ database: "nodeDB", query: "describe ?s", limit: 1 }, function (data) {

					expect(data).toBeDefined();
					expect(data).not.toBe(null);

					// Could be an array of JSON-LD objects
					if (data instanceof Array) {
						for (var i=0; i < data.length; i++) {
							expect(data[i]).toBeDefined();							
							if (data[i]['attributes']) {
								// node.js
								expect(data[i].get('@id')).toBeDefined();
							} else {
								// browser
								expect(data[i]['@id']).toBeDefined();
							}
						}
					}
					else {
						// At leat must have the context and an id.
						if (data['attributes']) {
							// node.js
							expect(data.get('@context')).toBeDefined();
							expect(data.get('@id')).toBeDefined();
						} else {
							// browser
							expect(data['@context']).toBeDefined();
							expect(data['@id']).toBeDefined();
						}
					}

					done();
				});
			});
		}, 10000);

	});

    // Just return a value to define the module export.
    return {};
}));
