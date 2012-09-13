var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the listDB test methods
// -----------------------------------

describe ("Optimize DBs Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should get NOT_FOUND status code trying to optimize a non-existent DB.", function(done) {
			
		conn.optimizeDB('nodeDB_optimize', function (data, response) {

			expect(response.statusCode).toBe(404);
			done();
		});

	});

	it ("should optimize an offline DB", function(done) {

		conn.offlineDB('nodeDB', 'WAIT', 5, function (data, response1) {

			expect(response1.statusCode).toBe(200);

			conn.copyDB('nodeDB', 'nodeDB_optimize', function (data, response2) {

				expect(response2.statusCode).toBe(200);

				conn.optimizeDB('nodeDB_optimize', function (data, response3) {

					expect(response3.statusCode).toBe(200);

					// Clean everything
					conn.dropDB('nodeDB_optimize', function (data, response4) {
						expect(response4.statusCode).toBe(200);

						conn.onlineDB('nodeDB', 'NO_WAIT', function (data, response5) {
							expect(response5.statusCode).toBe(200);

							done();
						})
					});
				});
			})
		});
	});

});