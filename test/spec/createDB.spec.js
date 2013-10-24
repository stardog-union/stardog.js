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
	// Describes the listDB test methods
	// -----------------------------------

	describe ("Create a new DB Test Suite", function() {
		var conn;

		if (typeof Async !== 'undefined') {
			self = new Async(this, 10000);
		}

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5820/");
			conn.setCredentials("admin", "admin");
		});

		afterEach(function() {
			conn = null;
		});

		self.it ("should not be able to create a new db with the name of an existing DB", function (done) {
			var options = {
				"database" : "nodeDB",
				"options" : { "index.type" : "disk" },
				"files": []
			}

			var filesArr = [];

			conn.createDB(options, function (data, response) {
				expect(response.statusCode).toBe(409);

				done();
			});
		});

		self.it ("should create a new empty DB, returning 201", function (done) {
			var options = {
				"database" : "nodeDB2",
				"options" : { "search.enabled" : true },
				"files" : []
			};

			// filesArr.push({
			// 	"name" : "api_tests.nt"
			// });
			
			conn.createDB(options, function (data, response) {
				expect(response.statusCode).toBe(201);
				// console.log(data);

				if (response.statusCode == 201) {
					// clean created DB after we know it was created
					conn.dropDB({ database: 'nodeDB2' }, function (data2, response2) {
						expect(response2.statusCode).toBe(200);

						done();
					});
				}
			});

		}, 10000);

		// it ("should create a new DB with data, returning 201", function (done) {
		// 	var options = {
		// 		"search.enabled" : true
		// 	};

		// 	var filesArr = [];
		// 	filesArr.push({
		// 		"name" : "api_tests.nt"
		// 	});
			
		// 	conn.createDB('newNodeDB', options, filesArr, function (data, response) {
		// 		expect(response.statusCode).toBe(201);
		// 		console.log(data);

		// 		if (response.statusCode === 201) {
		// 			conn.dropDB('newNodeDB', function (data2, response2) {
		// 				expect(response2.statusCode).toBe(200);

		// 				done();
		// 			});
		// 		}
		// 		else {
		// 			// console.log(data);
		// 			done();
		// 		}
		// 	}, 'data/api_tests.nt');

		// });

	});

	// Just return a value to define the module export.
	return {};
}));