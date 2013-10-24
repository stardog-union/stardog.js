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

	describe ("Copy DBs Test Suite", function() {
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

		self.it ("should not copy an online DB", function(done) {
			
			conn.dropDB({ database: 'nodeDB_copy' }, function (data, response2) {

				conn.copyDB({ dbsource: 'nodeDB', dbtarget: 'nodeDB_copy'}, function (data) {
					
					conn.listDBs(function (data) {

						expect(data.databases).not.toContain('nodeDB_copy');
						expect(data.databases).toContain('nodeDB');
						done();
					});

				});
			});
		});

		self.it("should copy an offline DB", function(done) {

			conn.dropDB({ database: 'nodeDB_copy' }, function (data, response2) {
				// drop if exists
				
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
		}, 10000);

	});

    // Just return a value to define the module export.
    return {};
}));
