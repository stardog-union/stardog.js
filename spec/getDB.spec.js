var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the getDB test methods
// -----------------------------------

describe ("Getting the DB info", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
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