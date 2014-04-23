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
	// Tests for transactions.
	// -----------------------------------

	describe ("Getting and using transactions.", function() {
		var conn;
		var txId;

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

		self.it("Should be able to get a transaction and make a query", function(done) {
			conn.onlineDB( { database: 'nodeDB', strategy: 'NO_WAIT' }, function (data5, response5) {
			
				conn.begin({ database: "nodeDB" }, function (body, response) {
					// console.log("body: ", body);
					expect(response.statusCode).toBe(200);
					expect(body).toBeDefined();
					expect(body).not.toBeNull();

					txId = body;
					// console.log(txId);

					// execute a query with the transaction ID
					conn.queryInTransaction({ 
							database: 'nodeDB', 
							"txId": txId, 
							query: "select distinct ?s where { ?s ?p ?o }", 
							limit: 10, 
							offset: 0
						},
						function (data) {
							expect(data).not.toBeNull();
							expect(data.results).toBeDefined();
							expect(data.results.bindings).toBeDefined();
							expect(data.results.bindings.length).toBeGreaterThan(0);
							expect(data.results.bindings.length).toBe(3);

							done();
					});
				});
			});
		});

		self.it("Should be able to get a transaction, add a triple and rollback", function(done) {

			var aTriple = '<http://localhost/publications/articles/Journal1/1940/Article2> '+
				'<http://purl.org/dc/elements/1.1/subject> '+
				'"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

			conn.onlineDB( { database: 'nodeDB', strategy: 'NO_WAIT' }, function (data5, response5) {

				conn.begin({ database: "nodeDB" }, function (body, response) {
					expect(response.statusCode).toBe(200);
					expect(body).toBeDefined();
					expect(body).not.toBeNull();

					txId = body;

					conn.addInTransaction(
						{ 
							database: "nodeDB",
							"txId": txId,
							"body": aTriple,
							contentType: "text/plain"
						},
						function (body2, response2) {
							expect(response2.statusCode).toBe(200);

							conn.rollback({ database: "nodeDB", "txId": txId }, function (body3, response3) {
								expect(response3.statusCode).toBe(200);
								done();
							});
						}
					);
				});
			});
		});

		self.it("Should be able to get a transaction, add a triple, commit that and query.", function(done) {

			var aTriple = '<http://localhost/publications/articles/Journal1/1940/Article2> '+
				'<http://purl.org/dc/elements/1.1/subject> '+
				'"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

			conn.onlineDB( { database: 'nodeDB', strategy: 'NO_WAIT' }, function (data5, response5) {

				conn.begin({ database: "nodeDB" }, function (body, response) {
					expect(response.statusCode).toBe(200);
					expect(body).toBeDefined();
					expect(body).not.toBeNull();

					txId = body;
					conn.addInTransaction(
						{ database: "nodeDB", "txId": txId, "body": aTriple, contentType: "text/plain" },
						function (body2, response2) {
							expect(response2.statusCode).toBe(200);

							conn.commit({ database: "nodeDB", "txId": txId }, function (body3, response3) {
								expect(response3.statusCode).toBe(200);
								// query for the triple added.
								conn.query(
									{ 
										database: "nodeDB",
										"query": 'ask where { '+
													'<http://localhost/publications/articles/Journal1/1940/Article2> '+
													'<http://purl.org/dc/elements/1.1/subject> '+
													'"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .}',
										mimetype: "text/boolean"
									},
									function (dataQ, responseQ) {
										//console.log(data);
										expect(responseQ.statusCode).toBe(200);
										expect(dataQ).not.toBe(null);
										var askResult;
										if (typeof dataQ === 'string') {
											askResult = (dataQ.toLowerCase() === 'true');
										} else {
											askResult = dataQ;
										}
										expect(askResult).toBe(true);

										// restore database state
										conn.begin({ database: "nodeDB" }, function (bodyB, responseB) {
											expect(responseB.statusCode).toBe(200);
											expect(bodyB).toBeDefined();
											expect(bodyB).not.toBeNull()
											
											var txId2 = bodyB;

											conn.removeInTransaction(
												{ database: "nodeDB", "txId": txId2, "body": aTriple, contentType: "text/plain" },
												function (bodyR, responseR) {
													expect(responseR.statusCode).toBe(200);

													conn.commit(
														{ database: "nodeDB", "txId": txId2 },
														function (bodyCD, responseCD) {
														expect(responseCD.statusCode).toBe(200);

														done();
													});
												}
											);
										});
									}
								);
							});
						}
					);
				});
			});
		});

		self.it("Should be able to clean and insert all data in the DB using a transaction.", function(done) {

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

			conn.onlineDB( { database: 'nodeDB', strategy: 'NO_WAIT' }, function (data5, response5) {

				conn.begin({ database: "nodeDB" }, function (dataB, responseB) {

					expect(responseB.statusCode).toBe(200);
					expect(dataB).toBeDefined();
					expect(dataB).not.toBeNull();

					txId = dataB;

					conn.clearDB({ database: "nodeDB", "txId": txId }, function (dataC, responseC) {
						expect(responseC.statusCode).toBe(200);

						// once cleared let's commit and then ask for the db size
						conn.commit({ database: "nodeDB", "txId": txId }, function (dataCom, responseCom) {
							expect(responseCom.statusCode).toBe(200);

							conn.getDBSize({ database: "nodeDB"}, function (dataS, responseS) {
								expect(responseS.statusCode).toBe(200);
								expect(dataS).toBeDefined();
								expect(dataS).not.toBe(null);

								var sizeNum = parseInt(dataS);
								expect(sizeNum).toBe(0);
								
								// restore the db content
								conn.begin({ database: "nodeDB" }, function (bodyB2, responseB2) {
									expect(responseB2.statusCode).toBe(200);
									expect(bodyB2).toBeDefined();
									expect(bodyB2).not.toBeNull();

									txId = bodyB2;

									conn.addInTransaction(
										{ database: "nodeDB", "txId": txId, body: dbContent, contentType: "text/plain" },
										function (dataA, responseA) {
											expect(responseA.statusCode).toBe(200);

											// commit
											conn.commit({ database: "nodeDB", "txId": txId }, function (dataCom2, responseCom2) {
												expect(responseCom2.statusCode).toBe(200);

												// check that the data is stored
												conn.getDBSize({ database: "nodeDB" }, function (dataS2, responseS2) {
													expect(responseS2.statusCode).toBe(200);
													expect(dataS2).toBeDefined();
													expect(dataS2).not.toBe(null);

													var sizeNum = parseInt(dataS2);
													expect(sizeNum).not.toBe(0);
													expect(sizeNum).toBeGreaterThan(1);

													done();
												});
											});

										}
									);
								});
							});
						});
					});
				});
			});
		});

	});

	// Just return a value to define the module export.
	return {};
}));
