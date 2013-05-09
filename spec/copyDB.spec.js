var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the listDB test methods
// -----------------------------------

describe ("Copy DBs Test Suite", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("should not copy an online DB", function(done) {
		
		conn.copyDB({ dbsource: 'nodeDB', dbtarget: 'nodeDB_copy'}, function (data) {
			
			conn.listDBs(function (data) {

				expect(data.databases).not.toContain('nodeDB_copy');
				expect(data.databases).toContain('nodeDB');
				done();
			});

		});

	});

	it ("should copy an offline DB", function(done) {

		conn.offlineDB({ database: 'nodeDB', strategy: "WAIT", timeout: 3 }, function (data) {

			// Once the DB is offline, copy it.
			conn.copyDB({ dbsource: 'nodeDB', dbtarget: 'nodeDB_copy' }, function (data) {
				
				conn.listDBs( function (data) {

					expect(data.databases).toContain('nodeDB_copy');
					expect(data.databases).toContain('nodeDB');
					
					// set database online again and drop copied DB.
					conn.onlineDB({ database: 'nodeDB' }, function (data, response1) {
						expect(response1.statusCode).toBe(200);
						
						conn.dropDB({ database: 'nodeDB_copy' }, function (data, response2) {
							expect(response2.statusCode).toBe(200);

							done();
						});
					})
				});

			});
		});
	});

});