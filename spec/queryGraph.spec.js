var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the queryGraph test methods
// -----------------------------------

describe ("Query a DB receiving a Graph in JSON-LD", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
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

			done();
		});
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

			done();
		});

	});

});