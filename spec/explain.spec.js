var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the explain test methods
// -----------------------------------

describe ("Getting the query plan of a Query", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("A response with the query plan should not be empty", function(done) {
		
		conn.queryExplain({ database: "nodeDB", query: "select ?s where { ?s ?p ?o } limit 10" }, function (response) {
			// console.log(response);
			expect(response).toBeDefined();
			expect(response).not.toBe(null);
			expect(response).toBe("Slice(offset=0, limit=10)\n  Projection(s)\n    Scan(subject='s', predicate='p', object='o')\n");

			done();
		});

	});

});