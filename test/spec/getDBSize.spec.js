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
	// Describes the getDBSize test methods
	// -----------------------------------

    describe ("Getting the size of the DB", function() {
    	var conn;

    	beforeEach(function() {
    		conn = new Stardog.Connection();
    		conn.setEndpoint("http://localhost:5822/");
    		conn.setCredentials("admin", "admin");
    	});

    	afterEach(function() {
    		conn = null;
    	});

    	it ("A response with the size of the DB should not be empty", function(done) {
    		
    		conn.getDBSize({ database: "nodeDB" }, function (response) {
    			console.log(response);
    			expect(response).toBeDefined();
    			expect(response).not.toBe(null);

    			var sizeNum = parseInt(response);
    			expect(sizeNum).toBeGreaterThan(0);
    			done();
    		});

    	});

    });

    // Just return a value to define the module export.
    return {};
}));
