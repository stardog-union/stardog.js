var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the listDB test methods
// -----------------------------------

describe ("Set DB Options Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should get NOT_FOUND status code trying to set the options of a non-existent DB.", function(done) {
			
		conn.setDBOptions({ database: 'nodeDB_test', optionsObj: { } }, function (data, response) {

			expect(response.statusCode).toBe(404);
			done();
		});

	});

	it ("should set the options of an DB", function(done) {
		var optionsObj = {
			"search.enabled" : true,
			"icv.enabled" : false
		};

		conn.offlineDB({ database: 'nodeDB', strategy: 'WAIT', timeout: 700 }, function (data, response1) {
			expect(response1.statusCode).toBe(200);

			conn.setDBOptions({ database: 'nodeDB', optionsObj: optionsObj }, function (data, response2) {
				expect(response2.statusCode).toBe(200);

				// set db back online

				conn.onlineDB({ database: 'nodeDB', strategy: 'NO_WAIT' }, function (data, response3) {
					expect(response3.statusCode).toBe(200);
					done();
				});
			});
		});
		
	});

});