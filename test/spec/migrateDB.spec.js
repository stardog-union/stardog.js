(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('../../js/stardog.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stardog'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog);
    }
}(this, function (Stardog) {

	// -----------------------------------
	// Describes the listDB test methods
	// -----------------------------------

	describe ("Migrate DBs Test Suite", function() {
		var conn;

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5822/");
			conn.setCredentials("admin", "admin");
		});

		afterEach(function() {
			conn = null;
		});

		it ("should get NOT_FOUND status code trying to migrate a non-existent DB.", function(done) {
				
			conn.migrateDB({ database: 'nodeDB_migrate' }, function (data, response) {

				expect(response.statusCode).toBe(404);
				done();
			});

		});

		it ("should migrate an offline DB", function(done) {
			var dbOrigin = "nodeDB";
			var dbToMigrate = "nodeDB_migrate";

			conn.offlineDB({ database: dbOrigin, strategy: 'WAIT', timeout: 5 }, function (data, response1) {
				expect(response1.statusCode).toBe(200);

				conn.copyDB({ dbsource: dbOrigin, dbtarget: dbToMigrate }, function (data, response2) {
					expect(response2.statusCode).toBe(200);

					// Check that the DB is actually in the DB list
					conn.listDBs(function (data, responseX) {
						expect(data.databases).toContain(dbToMigrate);

						conn.migrateDB({ database: dbToMigrate }, function (data, response3) {
							expect(response3.statusCode).toBe(200);

							// Clean everything
							conn.dropDB({ database: dbToMigrate }, function (data, response4) {
								expect(response4.statusCode).toBe(200);

								conn.onlineDB({ database: dbOrigin, strategy: 'NO_WAIT' }, function (data, response5) {
									expect(response5.statusCode).toBe(200);

									done();
								})
							});
						});

					});
				})
			});
		});

	});

    // Just return a value to define the module export.
    return {};
}));
