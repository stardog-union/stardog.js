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

	describe ("Set DB Options Test Suite", function() {
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

		self.it("should get NOT_FOUND status code trying to set the options of a non-existent DB.", function(done) {
				
			conn.setDBOptions({ database: 'nodeDB_test', optionsObj: { } }, function (data, response) {

				expect(response.statusCode).toBe(404);
				done();
			});
		});

		self.it("should set the options of an DB", function(done) {
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

    // Just return a value to define the module export.
    return {};
}));
