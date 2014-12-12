(function (root, factory) {
    "use strict";

    if (typeof exports === "object") {
        // NodeJS. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require("../js/stardog.js"), require("expect.js"));
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["stardog", "expect"], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog, root.expect);
    }
}(this, function (Stardog, expect) {
    "use strict";

    // -----------------------------------
    // Tests for transactions.
    // -----------------------------------

    describe ("Getting and using transactions.", function() {
        var conn;
        var txId;

        this.timeout(50000);

        beforeEach(function() {
            conn = new Stardog.Connection();
            conn.setEndpoint("http://localhost:5820/");
            conn.setCredentials("admin", "admin");
        });

        afterEach(function() {
            conn = null;
        });

        it("Should be able to get a transaction and make a query", function(done) {
            conn.onlineDB( { database: "nodeDB", strategy: "NO_WAIT" }, function () {
            
                conn.begin({ database: "nodeDB" }, function (body, response) {
                    // console.log("body: ", body);
                    expect(response.statusCode).to.be(200);
                    expect(body).not.to.be(undefined);
                    expect(body).not.to.be(null);

                    txId = body;
                    // console.log(txId);

                    // execute a query with the transaction ID
                    conn.queryInTransaction({ 
                            database: "nodeDB", 
                            "txId": txId, 
                            query: "select distinct ?s where { ?s ?p ?o }", 
                            limit: 10, 
                            offset: 0
                        },
                        function (data) {
                            expect(data).not.to.be(undefined);
                            expect(data.results).not.to.be(undefined);
                            expect(data.results.bindings).not.to.be(undefined);
                            expect(data.results.bindings.length).to.be.above(0);
                            expect(data.results.bindings.length).to.be(3);

                            done();
                    });
                });
            });
        });

        it("Should be able to get a transaction, add a triple and rollback", function(done) {

            var aTriple = "<http://localhost/publications/articles/Journal1/1940/Article2> "+
                "<http://purl.org/dc/elements/1.1/subject> "+
                "\"A very interesting subject\"^^<http://www.w3.org/2001/XMLSchema#string> .";

            conn.onlineDB( { database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.begin({ database: "nodeDB" }, function (body, response) {
                    expect(response.statusCode).to.be(200);
                    expect(body).not.to.be(undefined);
                    expect(body).not.to.be(null);

                    txId = body;

                    conn.addInTransaction(
                        { 
                            database: "nodeDB",
                            "txId": txId,
                            "body": aTriple,
                            contentType: "text/plain"
                        },
                        function (body2, response2) {
                            expect(response2.statusCode).to.be(200);

                            conn.rollback({ database: "nodeDB", "txId": txId }, function (body3, response3) {
                                expect(response3.statusCode).to.be(200);
                                done();
                            });
                        }
                    );
                });
            });
        });

        it("Should be able to get a transaction, add a triple with a defined prefix, commit that and query.", function(done) {

            var aTriple = "@prefix foo: <http://localhost/publications/articles/Journal1/1940/> .\n"+
                "@prefix dc: <http://purl.org/dc/elements/1.1/> .\n"+
                "foo:Article2 "+
                "dc:subject "+
                "\"A very interesting subject\"^^<http://www.w3.org/2001/XMLSchema#string> .";

            conn.onlineDB( { database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.begin({ database: "nodeDB" }, function (body, response) {
                    expect(response.statusCode).to.be(200);
                    expect(body).not.to.be(undefined);
                    expect(body).not.to.be(null);

                    txId = body;
                    conn.addInTransaction(
                        { database: "nodeDB", "txId": txId, "body": aTriple, contentType: "text/turtle" },
                        function (body2, response2) {
                            expect(response2.statusCode).to.be(200);

                            conn.commit({ database: "nodeDB", "txId": txId }, function (body3, response3) {
                                expect(response3.statusCode).to.be(200);
                                // query for the triple added.
                                conn.query(
                                    { 
                                        database: "nodeDB",
                                        "query":"prefix foo: <http://localhost/publications/articles/Journal1/1940/>\n"+ 
                                                "prefix dc: <http://purl.org/dc/elements/1.1/>\n"+ 
                                                "ask where { "+
                                                    "foo:Article2 "+
                                                    "dc:subject "+
                                                    "\"A very interesting subject\"^^<http://www.w3.org/2001/XMLSchema#string> .}",
                                        mimetype: "text/boolean"
                                    },
                                    function (dataQ, responseQ) {
                                        //console.log(data);
                                        expect(responseQ.statusCode).to.be(200);
                                        expect(dataQ).not.to.be(null);
                                        var askResult;
                                        if (typeof dataQ === "string") {
                                            askResult = (dataQ.toLowerCase() === "true");
                                        } else {
                                            askResult = dataQ;
                                        }
                                        expect(askResult).to.be(true);

                                        // restore database state
                                        conn.begin({ database: "nodeDB" }, function (bodyB, responseB) {
                                            expect(responseB.statusCode).to.be(200);
                                            expect(bodyB).not.to.be(undefined);
                                            expect(bodyB).not.to.be(null);
                                            
                                            var txId2 = bodyB;

                                            conn.removeInTransaction(
                                                { database: "nodeDB", "txId": txId2, "body": aTriple, contentType: "text/turtle" },
                                                function (bodyR, responseR) {
                                                    expect(responseR.statusCode).to.be(200);

                                                    conn.commit(
                                                        { database: "nodeDB", "txId": txId2 },
                                                        function (bodyCD, responseCD) {
                                                        expect(responseCD.statusCode).to.be(200);

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

        it("Should be able to get a transaction, add a triple, commit that and query.", function(done) {

            var aTriple = "<http://localhost/publications/articles/Journal1/1940/Article2> "+
                "<http://purl.org/dc/elements/1.1/subject> "+
                "\"A very interesting subject\"^^<http://www.w3.org/2001/XMLSchema#string> .";

            conn.onlineDB( { database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.begin({ database: "nodeDB" }, function (body, response) {
                    expect(response.statusCode).to.be(200);
                    expect(body).not.to.be(undefined);
                    expect(body).not.to.be(null);

                    txId = body;
                    conn.addInTransaction(
                        { database: "nodeDB", "txId": txId, "body": aTriple, contentType: "text/plain" },
                        function (body2, response2) {
                            expect(response2.statusCode).to.be(200);

                            conn.commit({ database: "nodeDB", "txId": txId }, function (body3, response3) {
                                expect(response3.statusCode).to.be(200);
                                // query for the triple added.
                                conn.query(
                                    { 
                                        database: "nodeDB",
                                        "query": "ask where { "+
                                                    "<http://localhost/publications/articles/Journal1/1940/Article2> "+
                                                    "<http://purl.org/dc/elements/1.1/subject> "+
                                                    "\"A very interesting subject\"^^<http://www.w3.org/2001/XMLSchema#string> .}",
                                        mimetype: "text/boolean"
                                    },
                                    function (dataQ, responseQ) {
                                        //console.log(data);
                                        expect(responseQ.statusCode).to.be(200);
                                        expect(dataQ).not.to.be(null);
                                        var askResult;
                                        if (typeof dataQ === "string") {
                                            askResult = (dataQ.toLowerCase() === "true");
                                        } else {
                                            askResult = dataQ;
                                        }
                                        expect(askResult).to.be(true);

                                        // restore database state
                                        conn.begin({ database: "nodeDB" }, function (bodyB, responseB) {
                                            expect(responseB.statusCode).to.be(200);
                                            expect(bodyB).not.to.be(undefined);
                                            expect(bodyB).not.to.be(null);
                                            
                                            var txId2 = bodyB;

                                            conn.removeInTransaction(
                                                { database: "nodeDB", "txId": txId2, "body": aTriple, contentType: "text/plain" },
                                                function (bodyR, responseR) {
                                                    expect(responseR.statusCode).to.be(200);

                                                    conn.commit(
                                                        { database: "nodeDB", "txId": txId2 },
                                                        function (bodyCD, responseCD) {
                                                        expect(responseCD.statusCode).to.be(200);

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

        it("Should be able to clean and insert all data in the DB using a transaction.", function(done) {

            var dbContent = "<http://localhost/publications/articles/Journal1/1940/Article1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://localhost/vocabulary/bench/Article> .\n"+
                "<http://localhost/publications/articles/Journal1/1940/Article1> <http://purl.org/dc/elements/1.1/creator> <http://localhost/persons/Paul_Erdoes> .\n"+
                "<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#journal> <http://localhost/publications/journals/Journal1/1940> .\n"+
                "<http://localhost/publications/articles/Journal1/1940/Article1> <http://localhost/vocabulary/bench/abstract> \"unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer splinting surmisers satisfying undamped sharpers forbearer anesthetization undermentioned outflanking funnyman commuted lachrymation floweret arcadian acridities unrealistic substituting surges preheats loggias reconciliating photocatalyst lenity tautological jambing sodality outcrop slipcases phenylketonuria grunts venturers valiantly unremorsefully extradites stollens ponderers conditione loathly cancels debiting parrots paraguayans resonates\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article1> <http://localhost/vocabulary/bench/cdrom> \"http://www.hogfishes.tld/richer/succories.html\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article1> <http://www.w3.org/2000/01/rdf-schema#seeAlso> \"http://www.gantleted.tld/succories/dwelling.html\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#month> \"4\"^^<http://www.w3.org/2001/XMLSchema#integer> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#note> \"overbites terminals giros podgy vagus kinkiest xix recollected\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#pages> \"110\"^^<http://www.w3.org/2001/XMLSchema#integer> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article1> <http://purl.org/dc/elements/1.1/title> \"richer dwelling scrapped\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article1> <http://xmlns.com/foaf/0.1/homepage> \"http://www.succories.tld/scrapped/prat.html\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "\n" +                  
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://localhost/vocabulary/bench/Article> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://purl.org/dc/elements/1.1/creator> <http://localhost/persons/John_Erdoes> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#journal> <http://localhost/publications/journals/Journal1/1940> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://localhost/vocabulary/bench/abstract> \"unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer splinting surmisers satisfying undamped sharpers forbearer anesthetization undermentioned outflanking funnyman commuted lachrymation floweret arcadian acridities unrealistic substituting surges preheats loggias reconciliating photocatalyst lenity tautological jambing sodality outcrop slipcases phenylketonuria grunts venturers valiantly unremorsefully extradites stollens ponderers conditione loathly cancels debiting parrots paraguayans resonates\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://localhost/vocabulary/bench/cdrom> \"http://www.hogfishes.tld/richer/succories.html\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://www.w3.org/2000/01/rdf-schema#seeAlso> \"http://www.gantleted.tld/succories/dwelling.html\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#month> \"8\"^^<http://www.w3.org/2001/XMLSchema#integer> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#note> \"overbites terminals giros podgy vagus kinkiest xix recollected\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#pages> \"240\"^^<http://www.w3.org/2001/XMLSchema#integer> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://purl.org/dc/elements/1.1/title> \"richer dwelling scrapped\"^^<http://www.w3.org/2001/XMLSchema#string> .\n"+
                    "<http://localhost/publications/articles/Journal1/1940/Article2> <http://xmlns.com/foaf/0.1/homepage> \"http://www.succories.tld/scrapped/prat2.html\"^^<http://www.w3.org/2001/XMLSchema#string> .\n";

            conn.onlineDB( { database: "nodeDB", strategy: "NO_WAIT" }, function () {

                conn.begin({ database: "nodeDB" }, function (dataB, responseB) {

                    expect(responseB.statusCode).to.be(200);
                    expect(dataB).not.to.be(undefined);
                    expect(dataB).not.to.be(null);

                    txId = dataB;

                    conn.clearDB({ database: "nodeDB", "txId": txId }, function (dataC, responseC) {
                        expect(responseC.statusCode).to.be(200);

                        // once cleared let"s commit and then ask for the db size
                        conn.commit({ database: "nodeDB", "txId": txId }, function (dataCom, responseCom) {
                            expect(responseCom.statusCode).to.be(200);

                            conn.getDBSize({ database: "nodeDB"}, function (dataS, responseS) {
                                expect(responseS.statusCode).to.be(200);
                                expect(dataS).not.to.be(undefined);
                                expect(dataS).not.to.be(null);

                                var sizeNum = parseInt(dataS);
                                expect(sizeNum).to.be(0);
                                
                                // restore the db content
                                conn.begin({ database: "nodeDB" }, function (bodyB2, responseB2) {
                                    expect(responseB2.statusCode).to.be(200);
                                    expect(bodyB2).not.to.be(undefined);
                                    expect(bodyB2).not.to.be(null);

                                    txId = bodyB2;

                                    conn.addInTransaction(
                                        { database: "nodeDB", "txId": txId, body: dbContent, contentType: "text/plain" },
                                        function (dataA, responseA) {
                                            expect(responseA.statusCode).to.be(200);

                                            // commit
                                            conn.commit({ database: "nodeDB", "txId": txId }, function (dataCom2, responseCom2) {
                                                expect(responseCom2.statusCode).to.be(200);

                                                // check that the data is stored
                                                conn.getDBSize({ database: "nodeDB" }, function (dataS2, responseS2) {
                                                    expect(responseS2.statusCode).to.be(200);
                                                    expect(dataS2).not.to.be(undefined);
                                                    expect(dataS2).not.to.be(null);

                                                    var sizeNum = parseInt(dataS2);
                                                    expect(sizeNum).not.to.be(0);
                                                    expect(sizeNum).to.be.above(1);

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
}));
