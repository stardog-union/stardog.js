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
			expect(data.results.bindings.length).toBe(3);
			done();
		});

	});

});

describe ("Query a DB with QL reasoning receiving a bind of results.", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
		conn.setReasoning("QL");
	});

	afterEach(function() {
		conn = null;
	});

	it ("A query to Vehicles must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Vehicle }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(3);
			done();
		});

	});

	it ("A query to Car must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Car }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(3);
			done();
		});

	});

	it ("A query to SportsCar must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :SportsCar }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(1);
			done();
		});

	});

});

describe ("Query a DB with RL reasoning receiving a bind of results.", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
		conn.setReasoning("RL");
	});

	afterEach(function() {
		conn = null;
	});

	it ("A query to Vehicles must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Vehicle }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(3);
			done();
		});

	});

	it ("A query to Car must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Car }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(3);
			done();
		});

	});

	it ("A query to SportsCar must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :SportsCar }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(1);
			done();
		});

	});

});

describe ("Query a DB with EL reasoning receiving a bind of results.", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
		conn.setReasoning("EL");
	});

	afterEach(function() {
		conn = null;
	});

	it ("A query to Vehicles must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Vehicle }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(3);
			done();
		});

	});

	it ("A query to Car must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Car }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(3);
			done();
		});

	});

	it ("A query to SportsCar must have result count to 3", function(done) {
		
		conn.query("nodeDBReasoning", "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :SportsCar }", null, 20, 0, function (data) {
			//console.log(data);

			expect(data).not.toBe(null);
			expect(data.results).toBeDefined();
			expect(data.results.bindings).toBeDefined();
			expect(data.results.bindings.length).toBeGreaterThan(0);
			expect(data.results.bindings.length).toBe(1);
			done();
		});

	});

});
