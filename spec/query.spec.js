var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the query test methods
// -----------------------------------

describe ("Query a DB receiving a bind of results.", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("A query result should not be empty", function(done) {
		
		conn.query("nodeDB", "select distinct ?s where { ?s ?p ?o }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(2);
			done();
		});

	});

});