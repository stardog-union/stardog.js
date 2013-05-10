var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Describes the getProperty test methods
// -----------------------------------

describe ("Querying properties from individuals", function() {
	var conn;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("Gets a specific property from the database", function(done) {
		
		conn.getProperty(
			{ 
				database: "nodeDB",
				uri: "<http://localhost/publications/articles/Journal1/1940/Article1>",
				property: "<http://localhost/vocabulary/bench/cdrom>"
			}, 
			function (response) {
				// console.log(response);
				expect(response).toBeDefined();
				expect(response).not.toBe(null);

				expect(response).toBe("http://www.hogfishes.tld/richer/succories.html");
				done();
			}
		);

	});

});