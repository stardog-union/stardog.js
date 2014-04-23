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
	// Gets DB Options
	// -----------------------------------

	describe ("Get DB Options Test Suite", function() {
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

		self.it ("should get NOT_FOUND status code trying to get the options of a non-existent DB.", function (done) {
			var optionsObj = {
				"search.enabled" : "",
				"icv.enabled" : ""
			};

			conn.onlineDB({ database: 'nodeDB_test' }, function (dataOnline, responseOnline) {
				// put online if it's not

				expect(responseOnline.statusCode).toBe(404);
				
				conn.getDBOptions({ "database": "nodeDB_test", "optionsObj": optionsObj }, function (data, response) {

					expect(response.statusCode).toBe(500);
					done();
				});
			});
		});

		self.it ("should get the options of an DB", function(done) {
			var optionsObj = {
				"search.enabled" : "",
				"icv.enabled" : ""
			};

			conn.onlineDB({ database: 'nodeDB' }, function (data3, response3) {
				// put online if it's not
				
				conn.getDBOptions({ "database": "nodeDB", "optionsObj": optionsObj }, function (data, respose2) {
					expect(respose2.statusCode).toBe(200);

					// check options retrieved
					expect(data["search.enabled"]).toBeDefined();
					expect(data["search.enabled"]).toBe(true);

					expect(data["icv.enabled"]).toBeDefined();
					expect(data["icv.enabled"]).toBe(false);
					done();
				});
			});
		});

	});

    // Just return a value to define the module export.
    return {};
}));
