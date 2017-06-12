const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('transactions', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('Should be able to get a transaction and make a query', done => {
    conn.begin({ database }, (txId, response) => {
      expect(response.statusCode).toEqual(200);
      //Lifed from https://stackoverflow.com/a/13653180/1011616
      expect(txId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      conn.queryInTransaction(
        {
          database,
          txId,
          query: "select ?s { VALUES ?s {'s'} }",
        },
        (data, resp) => {
          expect(data.results.bindings).toHaveLength(1);
          done();
        }
      );
    });
  });

  it('Should be able to get a transaction, add a triple and rollback', done => {
    var triple =
      '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
      '<http://purl.org/dc/elements/1.1/subject> ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    conn.begin({ database }, (txId, response) => {
      expect(response.statusCode).toEqual(200);
      expect(txId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      conn.addInTransaction(
        {
          database,
          txId,
          body: triple,
          contentType: 'text/turtle',
        },
        (body, response2) => {
          expect(response2.statusCode).toEqual(200);

          conn.rollback({ database, txId }, (body, response3) => {
            expect(response3.statusCode).toEqual(200);
            done();
          });
        }
      );
    });
  });

  it('Should be able to get a transaction, add a triple with a defined prefix, commit that and query.', done => {
    var triple =
      '@prefix foo: <http://localhost/publications/articles/Journal1/1940/> .\n' +
      '@prefix dc: <http://purl.org/dc/elements/1.1/> .\n' +
      'foo:Article2 ' +
      'dc:subject ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    conn.begin({ database }, (txId, response) => {
      expect(response.statusCode).toEqual(200);
      expect(txId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      conn.addInTransaction(
        {
          database,
          txId,
          body: triple,
          contentType: 'text/turtle',
        },
        (body2, response2) => {
          expect(response2.statusCode).toEqual(200);

          conn.commit({ database, txId }, (body3, response3) => {
            expect(response3.statusCode).toEqual(200);
            // query for the triple added.
            conn.query(
              {
                database,
                query:
                  'prefix foo: <http://localhost/publications/articles/Journal1/1940/>\n' +
                    'prefix dc: <http://purl.org/dc/elements/1.1/>\n' +
                    'ask where { ' +
                    'foo:Article2 ' +
                    'dc:subject ' +
                    '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .}',
              },
              (dataQ, responseQ) => {
                expect(responseQ.statusCode).toEqual(200);
                expect(dataQ.boolean).toEqual(true);

                // restore database state
                conn.begin({ database }, (txId, responseB) => {
                  expect(responseB.statusCode).toEqual(200);
                  expect(txId).toMatch(
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                  );

                  conn.removeInTransaction(
                    {
                      database,
                      txId,
                      body: triple,
                      contentType: 'text/turtle',
                    },
                    (bodyR, responseR) => {
                      expect(responseR.statusCode).toEqual(200);

                      conn.commit({ database, txId }, (bodyCD, responseCD) => {
                        expect(responseCD.statusCode).toEqual(200);
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

  it('Should be able to get a transaction, add a triple, commit that and query.', done => {
    var aTriple =
      '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
      '<http://purl.org/dc/elements/1.1/subject> ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    conn.begin({ database }, (txId, response) => {
      expect(response.statusCode).toEqual(200);
      expect(txId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      conn.addInTransaction(
        {
          database,
          txId,
          body: aTriple,
          contentType: 'text/turtle',
        },
        (body2, response2) => {
          expect(response2.statusCode).toEqual(200);

          conn.commit({ database, txId }, (body3, response3) => {
            expect(response3.statusCode).toEqual(200);
            // query for the triple added.
            conn.query(
              {
                database,
                query:
                  'ask where { ' +
                    '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
                    '<http://purl.org/dc/elements/1.1/subject> ' +
                    '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .}',
              },
              (dataQ, responseQ) => {
                expect(responseQ.statusCode).toEqual(200);
                expect(dataQ.boolean).toEqual(true);

                // restore database state
                conn.begin({ database }, (txId, responseB) => {
                  expect(responseB.statusCode).toEqual(200);
                  expect(txId).toMatch(
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                  );

                  conn.removeInTransaction(
                    {
                      database,
                      txId,
                      body: aTriple,
                      contentType: 'text/turtle',
                    },
                    (bodyR, responseR) => {
                      expect(responseR.statusCode).toEqual(200);

                      conn.commit({ database, txId }, (bodyCD, responseCD) => {
                        expect(responseCD.statusCode).toEqual(200);

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

  it('Should be able to clean and insert all data in the DB using a transaction.', done => {
    var dbContent =
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://localhost/vocabulary/bench/Article> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://purl.org/dc/elements/1.1/creator> <http://localhost/persons/Paul_Erdoes> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#journal> <http://localhost/publications/journals/Journal1/1940> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://localhost/vocabulary/bench/abstract> "unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer splinting surmisers satisfying undamped sharpers forbearer anesthetization undermentioned outflanking funnyman commuted lachrymation floweret arcadian acridities unrealistic substituting surges preheats loggias reconciliating photocatalyst lenity tautological jambing sodality outcrop slipcases phenylketonuria grunts venturers valiantly unremorsefully extradites stollens ponderers conditione loathly cancels debiting parrots paraguayans resonates"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://localhost/vocabulary/bench/cdrom> "http://www.hogfishes.tld/richer/succories.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://www.w3.org/2000/01/rdf-schema#seeAlso> "http://www.gantleted.tld/succories/dwelling.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#month> "4"^^<http://www.w3.org/2001/XMLSchema#integer> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#note> "overbites terminals giros podgy vagus kinkiest xix recollected"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://swrc.ontoware.org/ontology#pages> "110"^^<http://www.w3.org/2001/XMLSchema#integer> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://purl.org/dc/elements/1.1/title> "richer dwelling scrapped"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article1> <http://xmlns.com/foaf/0.1/homepage> "http://www.succories.tld/scrapped/prat.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://localhost/vocabulary/bench/Article> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://purl.org/dc/elements/1.1/creator> <http://localhost/persons/John_Erdoes> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#journal> <http://localhost/publications/journals/Journal1/1940> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://localhost/vocabulary/bench/abstract> "unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer splinting surmisers satisfying undamped sharpers forbearer anesthetization undermentioned outflanking funnyman commuted lachrymation floweret arcadian acridities unrealistic substituting surges preheats loggias reconciliating photocatalyst lenity tautological jambing sodality outcrop slipcases phenylketonuria grunts venturers valiantly unremorsefully extradites stollens ponderers conditione loathly cancels debiting parrots paraguayans resonates"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://localhost/vocabulary/bench/cdrom> "http://www.hogfishes.tld/richer/succories.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://www.w3.org/2000/01/rdf-schema#seeAlso> "http://www.gantleted.tld/succories/dwelling.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#month> "8"^^<http://www.w3.org/2001/XMLSchema#integer> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#note> "overbites terminals giros podgy vagus kinkiest xix recollected"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://swrc.ontoware.org/ontology#pages> "240"^^<http://www.w3.org/2001/XMLSchema#integer> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://purl.org/dc/elements/1.1/title> "richer dwelling scrapped"^^<http://www.w3.org/2001/XMLSchema#string> .\n' +
      '<http://localhost/publications/articles/Journal1/1940/Article2> <http://xmlns.com/foaf/0.1/homepage> "http://www.succories.tld/scrapped/prat2.html"^^<http://www.w3.org/2001/XMLSchema#string> .\n';

    conn.begin({ database }, (txId, responseB) => {
      expect(responseB.statusCode).toEqual(200);
      expect(txId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );

      conn.clearDB({ database, txId }, (dataC, responseC) => {
        expect(responseC.statusCode).toEqual(200);

        // once cleared let"s commit and then ask for the db size
        conn.commit({ database, txId }, (dataCom, responseCom) => {
          expect(responseCom.statusCode).toEqual(200);

          conn.getDBSize({ database }, (dataS, responseS) => {
            expect(responseS.statusCode).toEqual(200);
            expect(dataS).toEqual(expect.anything());

            var sizeNum = parseInt(dataS, 10);
            expect(sizeNum).toEqual(0);

            // restore the db content
            conn.begin({ database }, (txId, responseB2) => {
              expect(responseB2.statusCode).toEqual(200);
              expect(txId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
              );

              conn.addInTransaction(
                {
                  database,
                  txId,
                  body: dbContent,
                  contentType: 'text/turtle',
                },
                (dataA, responseA) => {
                  expect(responseA.statusCode).toEqual(200);

                  // commit
                  conn.commit({ database, txId }, (dataCom2, responseCom2) => {
                    expect(responseCom2.statusCode).toEqual(200);

                    // check that the data is stored
                    conn.getDBSize({ database }, (dataS2, responseS2) => {
                      expect(responseS2.statusCode).toEqual(200);
                      var sizeNum = parseInt(dataS2, 10);
                      expect(sizeNum).toBe(22);
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
