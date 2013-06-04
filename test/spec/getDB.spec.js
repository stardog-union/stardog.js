(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('../../js/stardog.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stardog'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog);
    }
}(this, function (Stardog) {

	// -----------------------------------
	// Describes the getDB test methods
	// -----------------------------------

	describe ("Getting the DB info", function() {
		var conn;

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5822/");
			conn.setCredentials("admin", "admin");
		});

		afterEach(function() {
			conn = null;
		});

		it ("A response of the DB info should not be empty", function(done) {
			
			conn.getDB({ database: "nodeDB" }, function (data, response) {
				// console.log("data: ", data);
				expect(data).toBeDefined();
				expect(data).not.toBe(null);
				expect(response).toBeDefined();
				expect(response).not.toBe(null);
				expect(response.statusCode).toBe(200);

				done();
			});

		});

	});

    // Just return a value to define the module export.
    return {};
}));
