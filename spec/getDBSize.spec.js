var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the getDBSize test methods
// -----------------------------------

describe ("Getting the size of the DB", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("A response with the size of the DB should not be empty", function(done) {
		
		conn.getDBSize("nodeDB", function (response) {
			// console.log(data);
			expect(response).toBeDefined();
			expect(response).not.toBe(null);

			var sizeNum = parseInt(response);
			expect(sizeNum).toBeGreaterThan(0);
			done();
		});

	});

});