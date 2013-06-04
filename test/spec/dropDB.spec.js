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

	describe ("Drop DBs Test Suite", function() {
		var conn;

		beforeEach(function() {
			conn = new Stardog.Connection();
			conn.setEndpoint("http://localhost:5822/");
			conn.setCredentials("admin", "admin");
		});

		afterEach(function() {
			conn = null;
		});

		it ("should not drop an non-existent DB", function (done) {
			
			conn.dropDB({ database: 'nodeDB_drop' }, function (data, response) {
				expect(response.statusCode).toBe(404);

				expect(data).toMatch('does not exist');
				done();

			});

		});

		it ("should drop a just created database", function (done) {

			conn.offlineDB({ database: 'nodeDB', strategy: 'WAIT', timeout: 1 }, function (data, response) {
				expect(response.statusCode).toBe(200);

				conn.copyDB({ dbsource: 'nodeDB', dbtarget: 'nodeDB_drop' }, function (data, response) {
					expect(response.statusCode).toBe(200);

					// Clean just created DB.
					conn.dropDB({ database: 'nodeDB_drop' }, function (data, response) {
						expect(response.statusCode).toBe(200);

						// set nodeDB back online
						conn.onlineDB( { database: 'nodeDB', strategy: 'NO_WAIT' }, function (data, response) {
							expect(response.statusCode).toBe(200);

							done();
						});

						done();
					});
				});
			});
		});

	});

    // Just return a value to define the module export.
    return {};
}));
