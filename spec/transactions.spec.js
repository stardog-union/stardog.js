var stardog = require('../js/stardog');
var qs = require('querystring');

// -----------------------------------
// Tests for transactions.
// -----------------------------------

describe ("Getting and using transactions.", function() {
	var conn;
	var txId;

	beforeEach(function() {
		conn = new stardog.Connection();
		conn.setEndpoint("http://localhost:5822/");
		conn.setCredentials("admin", "admin");
	});

	afterEach(function() {
		conn = null;
	});

	it ("Should be able to get a transaction and make a query", function(done) {
		
		conn.begin("nodeDB", function (body, response) {
			expect(response.statusCode).toBe(200);
			expect(body).toBeDefined();
			expect(body).not.toBeNull();

			txId = body;

			// execute a query with the transaction ID
			conn.queryInTransaction('nodeDB', txId, "select distinct ?s where { ?s ?p ?o }", null, 10, 0, function (data) {
				expect(data).not.toBeNull();
				expect(data.results).toBeDefined();
				expect(data.results.bindings).toBeDefined();
				expect(data.results.bindings.length).toBeGreaterThan(0);
				expect(data.results.bindings.length).toBe(3);

				done();
			});
		});

	});

	it ("Should be able to get a transaction, add a triple and rollback", function(done) {

		var aTriple = '<http://localhost/publications/articles/Journal1/1940/Article2> '+
			'<http://purl.org/dc/elements/1.1/subject> '+
			'"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

		conn.begin("nodeDB", function (body, response) {
			expect(response.statusCode).toBe(200);
			expect(body).toBeDefined();
			expect(body).not.toBeNull();

			txId = body;

			conn.addInTransaction("nodeDB", txId, aTriple, function (body2, response2) {
				expect(response2.statusCode).toBe(200);
				//console.log(body2);

				conn.rollback("nodeDB", txId, function (body3, response3) {
					expect(response3.statusCode).toBe(200);
					done();
				});
			},
			"text/plain");
		});
	});

	it ("Should be able to get a transaction, add a triple, commit that and query.", function(done) {

		var aTriple = '<http://localhost/publications/articles/Journal1/1940/Article2> '+
			'<http://purl.org/dc/elements/1.1/subject> '+
			'"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

		conn.begin("nodeDB", function (body, response) {
			expect(response.statusCode).toBe(200);
			expect(body).toBeDefined();
			expect(body).not.toBeNull();

			txId = body;

			conn.addInTransaction("nodeDB", txId, aTriple, function (body2, response2) {
				expect(response2.statusCode).toBe(200);
				//console.log(body2);

				conn.commit("nodeDB", txId, function (body3, response3) {
					expect(response3.statusCode).toBe(200);

					// query for the triple added.
					conn.query("nodeDB", 'ask where { '+
						'<http://localhost/publications/articles/Journal1/1940/Article2> '+
						'<http://purl.org/dc/elements/1.1/subject> '+
						'"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .}', null, null, null, function (dataQ, responseQ) {
						//console.log(data);
						expect(responseQ.statusCode).toBe(200);
						expect(dataQ).not.toBe(null);
						expect(dataQ).toBe(true);
						
						// restore database state
						conn.begin("nodeDB", function (bodyB, responseB) {
							expect(responseB.statusCode).toBe(200);
							expect(bodyB).toBeDefined();
							expect(bodyB).not.toBeNull();

							var txId2 = bodyB;

							conn.removeInTransaction("nodeDB", txId2, aTriple, function (bodyR, responseR) {
								expect(responseR.statusCode).toBe(200);

								conn.commit("nodeDB", txId2, function (bodyCD, responseCD) {
									expect(responseCD.statusCode).toBe(200);

									done();
								});
							}, "text/plain");
						});
					}, "text/boolean");
				});
			}, "text/plain");
		});
	});

	it ("Should be able to clean and insert all data in the DB using a transaction.", function(done) {

		var dbContent = '<http://localhost/publications/articles/Journal1/1940/Article1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://localhost/vocabulary/bench/Article> .\n'+
			'<http://localhost/publications/articles/Journal1/1940/Article1> <http://purl.org/dc/elements/1.1/creator> <http://localhost/persons/Paul_Erdoes> .\n'+
			'<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#journal> <http://localhost/publications/journals/Journal1/1940> .\n'+
			'<http://localhost/publications/articles/Journal1/1940/Article1> <http://localhost/vocabulary/bench/abstract> "unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer splinting surmisers satisfying undamped sharpers forbearer anesthetization undermentioned outflanking funnyman commuted lachrymation floweret arcadian acridities unrealistic substituting surges preheats loggias reconciliating photocatalyst lenity tautological jambing sodality outcrop slipcases phenylketonuria grunts venturers valiantly unremorsefully extradites stollens ponderers conditione loathly cancels debiting parrots paraguayans resonates"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article1> <http://localhost/vocabulary/bench/cdrom> "http://www.hogfishes.tld/richer/succories.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article1> <http://www.w3.org/2000/01/rdf-schema#seeAlso> "http://www.gantleted.tld/succories/dwelling.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#month> "4"^^<http://www.w3.org/2001/XMLSchema#integer> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#note> "overbites terminals giros podgy vagus kinkiest xix recollected"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#pages> "110"^^<http://www.w3.org/2001/XMLSchema#integer> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article1> <http://purl.org/dc/elements/1.1/title> "richer dwelling scrapped"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article1> <http://xmlns.com/foaf/0.1/homepage> "http://www.succories.tld/scrapped/prat.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'\n' +					
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://localhost/vocabulary/bench/Article> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://purl.org/dc/elements/1.1/creator> <http://localhost/persons/John_Erdoes> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#journal> <http://localhost/publications/journals/Journal1/1940> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://localhost/vocabulary/bench/abstract> "unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer splinting surmisers satisfying undamped sharpers forbearer anesthetization undermentioned outflanking funnyman commuted lachrymation floweret arcadian acridities unrealistic substituting surges preheats loggias reconciliating photocatalyst lenity tautological jambing sodality outcrop slipcases phenylketonuria grunts venturers valiantly unremorsefully extradites stollens ponderers conditione loathly cancels debiting parrots paraguayans resonates"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://localhost/vocabulary/bench/cdrom> "http://www.hogfishes.tld/richer/succories.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://www.w3.org/2000/01/rdf-schema#seeAlso> "http://www.gantleted.tld/succories/dwelling.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#month> "8"^^<http://www.w3.org/2001/XMLSchema#integer> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#note> "overbites terminals giros podgy vagus kinkiest xix recollected"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#pages> "240"^^<http://www.w3.org/2001/XMLSchema#integer> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://purl.org/dc/elements/1.1/title> "richer dwelling scrapped"^^<http://www.w3.org/2001/XMLSchema#string> .\n'+
				'<http://localhost/publications/articles/Journal1/1940/Article2> <http://xmlns.com/foaf/0.1/homepage> "http://www.succories.tld/scrapped/prat2.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n';

		conn.begin("nodeDB", function (dataB, responseB) {

			expect(responseB.statusCode).toBe(200);
			expect(dataB).toBeDefined();
			expect(dataB).not.toBeNull();

			txId = dataB;

			conn.clearDB("nodeDB", txId, function (dataC, responseC) {
				expect(responseC.statusCode).toBe(200);

				// once cleared let's commit and then ask for the db size
				conn.commit("nodeDB", txId, function (dataCom, responseCom) {
					expect(responseCom.statusCode).toBe(200);

					conn.getDBSize("nodeDB", function (dataS, responseS) {
						expect(responseS.statusCode).toBe(200);
						expect(dataS).toBeDefined();
						expect(dataS).not.toBe(null);

						var sizeNum = parseInt(dataS);
						expect(sizeNum).toBe(0);
						
						// restore the db content
						conn.begin("nodeDB", function (bodyB2, responseB2) {
							expect(responseB2.statusCode).toBe(200);
							expect(bodyB2).toBeDefined();
							expect(bodyB2).not.toBeNull();

							txId = bodyB2;

							conn.addInTransaction("nodeDB", txId, dbContent, function (dataA, responseA) {
								expect(responseA.statusCode).toBe(200);

								// commit
								conn.commit("nodeDB", txId, function (dataCom2, responseCom2) {
									expect(responseCom2.statusCode).toBe(200);

									// check that the data is stored
									conn.getDBSize("nodeDB", function (dataS2, responseS2) {
										expect(responseS2.statusCode).toBe(200);
										expect(dataS2).toBeDefined();
										expect(dataS2).not.toBe(null);

										var sizeNum = parseInt(dataS2);
										expect(sizeNum).not.toBe(0);
										expect(sizeNum).toBeGreaterThan(1);

										done();
									});
								});

							}, "text/plain");
						});
					});
				});
			});
		});
	});

});
