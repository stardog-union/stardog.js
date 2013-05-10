var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the listDB test methods
// -----------------------------------

describe ("Listing DBs Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should not be empty", function(done) {
		
		conn.listDBs(function (data) {
			expect(data).not.toBe(null);
			expect(data.databases).toBeDefined();
			expect(data.databases).not.toBeNull();
			expect(data.databases.length).not.toBeLessThan(0);
			done();
		});

	});

	it ("should contain nodeDB db (previously loaded)", function(done) {
		
		conn.listDBs(function (data) {
			expect(data.databases).toContain('nodeDB');
			done();
		});

	});

});