(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('../../js/stardog.js'), require('../lib/async.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stardog', 'async'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog, async);
    }
}(this, function (Stardog, Async) {

	// -----------------------------------
	// Describes the listDB test methods
	// -----------------------------------

	describe ("Drop DBs Test Suite", function() {
		var conn,
			checkDone = (new Async()).done;

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
				if (done) { // node.js
					done() 
				}
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

		it ("should drop a just created database", function (done) {

			conn.dropDB({ database: 'nodeDB_drop' }, function (data1, response1) {
				// drop if exists

				conn.offlineDB({ database: 'nodeDB', strategy: 'WAIT', timeout: 1 }, function (data2, response2) {
					expect(response2.statusCode).toBe(200);

					conn.copyDB({ dbsource: 'nodeDB', dbtarget: 'nodeDB_drop' }, function (data3, response3) {
						expect(response3.statusCode).toBe(200);

						// Clean just created DB.
						conn.dropDB({ database: 'nodeDB_drop' }, function (data4, response4) {
							expect(response4.statusCode).toBe(200);

							// set nodeDB back online
							conn.onlineDB( { database: 'nodeDB', strategy: 'NO_WAIT' }, function (data5, response5) {
								expect(response5.statusCode).toBe(200);

								if (done) { // node.js
									done() 
								}
							});
						});
					});
				});
			});

			waitsFor(checkDone, 5000); // does nothing in node.js
		});

	});

    // Just return a value to define the module export.
    return {};
}));
