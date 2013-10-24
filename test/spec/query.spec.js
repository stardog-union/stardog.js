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
	// Describes the query test methods
	// -----------------------------------

	describe ("Query a DB receiving a bind of results.", function() {
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

		self.it ("A query result should not be empty", function(done) {
			conn.onlineDB({ database: 'nodeDB', strategy: 'NO_WAIT' }, function (data2, response) {

				conn.query(
					{ database: "nodeDB", query: "select distinct ?s where { ?s ?p ?o }",  limit: 20, offset: 0 },
					function (data) {
						//console.log(data);

						expect(data).not.toBe(null);
						expect(data.results).toBeDefined();
						expect(data.results.bindings).toBeDefined();
						expect(data.results.bindings.length).toBeGreaterThan(0);
						expect(data.results.bindings.length).toBe(3);
						done();
				});
			});
		}, 10000);

	});

	describe ("Query a DB with QL reasoning receiving a bind of results.", function() {
		var conn;

		if (typeof Async !== 'undefined') {
			self = new Async(this);
		}

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5820/");
			conn.setCredentials("admin", "admin");
			conn.setReasoning("QL");
		});

		afterEach(function() {
			conn = null;
		});

		self.it ("A query to Vehicles must have result count to 3", function(done) {
			
			conn.query(
				{ 
					database: "nodeDBReasoning", 
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Vehicle }", 
					limit: 20, 
					offset: 0 
				},
				function (data) {
					//console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(3);
					done();
			});
		}, 10000);

		self.it ("A query to Car must have result count to 3", function(done) {
			conn.query(
				{ 
					database: "nodeDBReasoning", 
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Car }", 
					limit: 20, 
					offset: 0 
				},
				function (data) {
					// console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(3);
					done();
			});
		}, 10000);

		self.it ("A query to SportsCar must have result count to 3", function(done) {
			
			conn.query(
				{ 
					database: "nodeDBReasoning", 
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :SportsCar }", 
					limit: 20, 
					offset: 0 
				},
				function (data) {
					//console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(1);
					done();
			});
		}, 10000);

	});

	describe ("Query a DB with RL reasoning receiving a bind of results.", function() {
		var conn;

		if (typeof Async !== 'undefined') {
			self = new Async(this);
		}

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5820/");
			conn.setCredentials("admin", "admin");
			conn.setReasoning("RL");
		});

		afterEach(function() {
			conn = null;
		});

		self.it ("A query to Vehicles must have result count to 3", function(done) {
			
			conn.query(
				{ 
					database: "nodeDBReasoning",
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Vehicle }", 
					limit: 20,
					offset: 0
				}, 
				function (data) {
					//console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(3);
					done();
			});
		}, 10000);

		self.it ("A query to Car must have result count to 3", function(done) {
			
			conn.query(
				{ 
					database: "nodeDBReasoning",
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Car }",
					limit: 20,
					offset: 0
				}, 
				function (data) {
					//console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(3);
					done();
			});
		}, 10000);

		self.it ("A query to SportsCar must have result count to 1", function(done) {
			
			conn.query(
				{
					database: "nodeDBReasoning", 
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :SportsCar }",
					limit: 20,
					offset: 0
				}, 
				function (data) {
					//console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(1);
					done();
			});
		}, 10000);

	});

	describe ("Query a DB with EL reasoning receiving a bind of results.", function() {
		var conn;

		if (typeof Async !== 'undefined') {
			self = new Async(this);
		}

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5820/");
			conn.setCredentials("admin", "admin");
			conn.setReasoning("EL");
		});

		afterEach(function() {
			conn = null;
		});

		self.it ("A query to Vehicles must have result count to 3", function(done) {
			
			conn.query(
				{
					database: "nodeDBReasoning", 
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Vehicle }", 
					limit: 20,
					offset: 0
				}, 
				function (data) {
					//console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(3);
					done();
			});
		}, 10000);

		self.it ("A query to Car must have result count to 3", function(done) {
			
			conn.query(
				{
					database: "nodeDBReasoning", 
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :Car }",
					limit: 20,
					offset: 0
				}, 
				function (data) {
					//console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(3);
					done();
			});
		}, 10000);

		self.it ("A query to SportsCar must have result count to 1", function(done) {
			
			conn.query(
				{
					database: "nodeDBReasoning",
					query: "prefix : <http://example.org/vehicles/> select distinct ?s where { ?s a :SportsCar }",
					limit: 20,
					offset: 0
				}, 
				function (data) {
					//console.log(data);

					expect(data).not.toBe(null);
					expect(data.results).toBeDefined();
					expect(data.results.bindings).toBeDefined();
					expect(data.results.bindings.length).toBeGreaterThan(0);
					expect(data.results.bindings.length).toBe(1);
					done();
			});
		}, 10000);

	});

    // Just return a value to define the module export.
    return {};
}));
