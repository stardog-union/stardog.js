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
	// Describes the getProperty test methods
	// -----------------------------------

	describe ("Querying properties from individuals", function() {
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

		self.it ("Gets a specific property from the database", function(done) {
			conn.onlineDB({ database: 'nodeDB' }, function (data3, response3) {
				// put online if it's not

				conn.getProperty(
					{ 
						database: "nodeDB",
						uri: "<http://localhost/publications/articles/Journal1/1940/Article1>",
						property: "<http://localhost/vocabulary/bench/cdrom>"
					}, 
					function (response) {
						// console.log(response);
						expect(response).toBeDefined();
						expect(response).not.toBe(null);

						expect(response).toBe("http://www.hogfishes.tld/richer/succories.html");
						done();
					}
				);
			});
		});

	});

    // Just return a value to define the module export.
    return {};
}));
