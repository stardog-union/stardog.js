/* eslint-env jest */

const {
  query,
  db: { transaction },
} = require('../lib');

const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('query.execute()', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();
  const execute = query.execute.bind(null, conn, database);
  const begin = transaction.begin.bind(null, conn, database);

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('A query result should not be empty', () =>
    execute('select distinct ?s where { ?s ?p ?o }', undefined, {
      reasoning: true,
    }).then((res) => {
      expect(res.body.results.bindings).toHaveLength(31);
    }));

  it('Should be able to query in a transaction', () =>
    begin()
      .then((res) => {
        expect(res.status).toEqual(200);
        return query.executeInTransaction(
          conn,
          database,
          res.body,
          'select distinct ?s where { ?s ?p ?o }',
          undefined,
          { limit: 10 }
        );
      })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(10);
      }));

  it('A query result should work with property paths', () =>
    execute(
      `select * {
          ?a a <http://localhost/vocabulary/bench/Article> ;
               <http://purl.org/dc/elements/1.1/title> ?title ;
               <http://purl.org/dc/elements/1.1/creator> ?c .
          ?c (<http://xmlns.com/foaf/0.1/firstName> | <http://xmlns.com/foaf/0.1/lastName>)+ ?name
        }`,
      undefined,
      {
        reasoning: true,
      }
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(6);
    }));

  it('A query result should not have more bindings than its intended limit', () =>
    execute('select * where { ?s ?p ?o }', undefined, {
      limit: 10,
    }).then((res) => {
      expect(res.body.results.bindings).toHaveLength(10);
    }));

  it('The baseURI option should be applied to the query', () =>
    Promise.all([
      execute(
        'select * {?s a <http://localhost/publications/articles/Journal1/1940/Article>}',
        {
          limit: 10,
        }
      ),
      execute('select * {?s a <Article>}', {
        baseURI: 'http://localhost/publications/articles/Journal1/1940/',
        limit: 10,
      }),
    ]).then(([noBase, base]) => {
      expect(noBase.body).toEqual(base.body);
    }));

  it('Very long queries should be OK', () =>
    execute(
      'select * where { <http://localhost/publications/articles/Journal1/1940/Article1> ?p "unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary burlily thanklessly swiveled polers oinked apnea maxillary burlily thanklessly swiveled polers oinked apnea maxillary" }'
    ).then((res) => expect(res.status).toBe(200)));

  it('A query to Articles must have result count to 3', () =>
    execute(
      'select distinct * where { ?s a <http://localhost/vocabulary/bench/Article> }'
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to Car must have result count to 3', () =>
    execute(
      'select distinct * where { ?s a <http://example.org/vehicles/Car> }',
      undefined,
      {
        reasoning: true,
      }
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to SportsCar must have result count to 1', () =>
    execute(
      'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }'
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(1);
    }));

  it('A query to Vehicles must have result count to 3', () =>
    execute(
      'select distinct * where { ?s a <http://example.org/vehicles/Vehicle> }',
      undefined,
      {
        reasoning: true,
      }
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to SportsCar must have result count to 1', () =>
    execute(
      'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }'
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(1);
    }));

  it('A query to Vehicles must have result count to 3', () =>
    execute(
      'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      undefined,
      {
        reasoning: true,
      }
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to Car must have result count to 3', () =>
    execute(
      'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
      undefined,
      {
        reasoning: true,
      }
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to Vehicle must have result count to 0 w/o reasoning', () =>
    execute(
      'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      undefined,
      {
        reasoning: false,
      }
    ).then((res) => {
      expect(res.body.results.bindings).toHaveLength(0);
    }));

  it('returns a true boolean for an ASK query', () =>
    execute(
      'ask {<http://myvehicledata.com/FerrariEnzo> a <http://example.org/vehicles/SportsCar>}'
    ).then((res) => {
      expect(res.body).toBe(true);
    }));

  it('returns a false boolean for an ASK query', () =>
    execute(
      'ask {<http://myvehicledata.com/FerrariEnzo> a <http://example.org/vehicles/Sedan>}'
    ).then((res) => {
      expect(res.body).toBe(false);
    }));

  it('returns results for a construct query as json-ld', () =>
    execute('construct where { ?s ?p ?o }', 'application/ld+json').then(
      ({ body }) => {
        expect(body['@graph'].length).toBeGreaterThan(0);
        for (let i = 0; i < body.length; i += 1) {
          expect(body['@graph'][i]['@id']).not.toBeNull();
        }
      }
    ));
  it('returns results for a construct query as a string blob', () =>
    execute('construct where { ?s ?p ?o }').then(({ body }) =>
      expect(body).toContain(
        '<http://localhost/persons/John_Erdoes> a <http://xmlns.com/foaf/0.1/Person>'
      )
    ));

  it('returns results for a describe query as a string blob', () =>
    execute(
      'describe <http://localhost/publications/articles/Journal1/1940/Article1>',
      undefined,
      {
        limit: 1,
      }
    ).then(({ body }) => {
      expect(body).toEqual(
        '<http://localhost/publications/articles/Journal1/1940/Article1> a <http://localhost/vocabulary/bench/Article> ;\n' +
          '   <http://purl.org/dc/elements/1.1/creator> <http://localhost/persons/Paul_Erdoes> ;\n' +
          '   <http://swrc.ontoware.org/ontology#journal> <http://localhost/publications/journals/Journal1/1940> ;\n' +
          '   <http://localhost/vocabulary/bench/abstract> "unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer splinting surmisers satisfying undamped sharpers forbearer anesthetization undermentioned outflanking funnyman commuted lachrymation floweret arcadian acridities unrealistic substituting surges preheats loggias reconciliating photocatalyst lenity tautological jambing sodality outcrop slipcases phenylketonuria grunts venturers valiantly unremorsefully extradites stollens ponderers conditione loathly cancels debiting parrots paraguayans resonates" ;\n' +
          '   <http://localhost/vocabulary/bench/cdrom> "http://www.hogfishes.tld/richer/succories.html" ;\n' +
          '   <http://www.w3.org/2000/01/rdf-schema#seeAlso> "http://www.gantleted.tld/succories/dwelling.html" ;\n' +
          '   <http://swrc.ontoware.org/ontology#month> 4 ;\n' +
          '   <http://swrc.ontoware.org/ontology#note> "overbites terminals giros podgy vagus kinkiest xix recollected" ;\n' +
          '   <http://swrc.ontoware.org/ontology#pages> 110 ;\n' +
          '   <http://purl.org/dc/elements/1.1/title> "richer dwelling scrapped" ;\n' +
          '   <http://xmlns.com/foaf/0.1/homepage> "http://www.succories.tld/scrapped/prat.html" .'
      );
      expect(body).toHaveLength(1923);
    }));

  describe('group_concat', () => {
    it('should return values', () =>
      execute(
        `select ?s (Group_Concat(?o ; separator=",") as ?o_s) where { ?s <http://xmlns.com/foaf/0.1/firstName> | <http://xmlns.com/foaf/0.1/lastName> ?o } group by ?s`
      ).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(3);
      }));
  });

  describe('additionalHandlers', () => {
    it('onResponseStart should be called when execute response begins', () => {
      let responseCompleted = false;

      execute(`select distinct ?s where { ?s ?p ?o }`, undefined, undefined, {
        onResponseStart(res) {
          expect(res.status).toBe(200);
          expect(responseCompleted).toBe(false);
        },
      }).then(() => {
        responseCompleted = true;
      });
    });

    it('should not interfere with the full response being passed back', () => {
      execute(`select distinct ?s where { ?s ?p ?o }`, undefined, undefined, {
        onResponseStart(res) {
          return res;
        },
      }).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(33);
      });
    });

    it('should prevent further processing when `onResponseStart` explicitly returns `false`', () => {
      execute(`select distinct ?s where { ?s ?p ?o }`, undefined, undefined, {
        onResponseStart() {
          return false;
        },
      }).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results).not.toBeDefined();
      });
    });
  });

  describe('paths', () => {
    const prefixes = 'prefix : <urn:paths:> ';
    it('should run a simple paths query', () =>
      execute(`${prefixes} paths start ?x = :Alice end ?y via ?p`).then(
        (res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(11);
        }
      ));

    it('should run a more specific query', () =>
      execute(
        `${prefixes} paths start ?x = :Alice end ?y = :David via :knows`
      ).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(2);
      }));

    it('should run a complex query', () =>
      execute(
        `${prefixes} paths start ?x = :Alice end ?y = :David via { {?x ?p ?y} union {?y ?p ?x} }`
      ).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(2);
      }));

    it('should return all paths', () =>
      execute(
        `${prefixes} paths all start ?x = :Alice end ?y = :David via { {?x ?p ?y} union {?y ?p ?x} }`
      ).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(7);
      }));

    it('should return cyclic paths', () =>
      execute(
        `${prefixes} paths cyclic start ?start end ?end via :dependsOn`
      ).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(17);
      }));

    it('runs queries with a limit', () =>
      execute(`${prefixes} paths start ?x = :Alice end ?y via ?p limit 2`).then(
        (res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(4);
        }
      ));

    it('runs queries with a max length', () =>
      execute(
        `${prefixes} paths start ?x = :Alice end ?y via ?p max length 2`
      ).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(7);
      }));
  });

  describe('update', () => {
    afterEach(() => execute('clear all'));

    it('should support "insert data"', () =>
      execute('insert data {:foo :bar :baz}')
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body).toBe(null);
          return execute(`select * {:foo ?p ?o}`);
        })
        .then((res) => {
          expect(res.body.results.bindings).toHaveLength(1);
        }));

    it('should support "delete data"', () => {
      const data = '<urn:foo> <urn:bar> <urn:baz>';
      const select = `select * {<urn:foo> ?p ?o}`;
      return execute(select)
        .then((res) => {
          expect(res.body.results.bindings).toHaveLength(0);
          return execute(`insert data {${data}}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(1);
          return execute(`delete data {${data}}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then((res) => {
          expect(res.body.results.bindings).toHaveLength(0);
        });
    });

    it('should support "delete/insert"', () =>
      execute(`insert data {:foo :someProp 0}`)
        .then(() =>
          execute(`
          delete {?s :someProp ?o}
          insert {?s :someProp 42}
          where {?s :someProp ?o}
        `)
        )
        .then((res) => {
          expect(res.status).toBe(200);
          return execute('select * {:foo :someProp ?o}');
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(1);
          expect(res.body.results.bindings[0].o.value).toBe('42');
        }));

    it('should support "delete where"', () => {
      const bgp = '{:a ?p ?o}';
      return execute('insert data {:a :b :c; :d :e; :f :g}')
        .then((res) => {
          expect(res.status).toBe(200);
          return execute(`select * ${bgp}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(3);
          return execute(`delete where ${bgp}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute(`select * ${bgp}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(0);
        });
    });

    it('should support "insert where"', () => {
      const select = 'select * {:A ?p :B}';
      return execute('insert data {:A :prop1 :B}')
        .then((res) => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(1);
          return execute('insert {?s :prop2 ?o} where {?s :prop1 ?o}');
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(2);
        });
    });

    it('should support "load"', () =>
      // Requires a publicly available RDF file, but we can test the failure case
      execute('load <http://not.a.real.website/at#all>').then((res) => {
        expect(res.status).toBeGreaterThanOrEqual(400);
        return execute('load silent <http://not.a.real.website/at#all>');
      }));
    // TODO: restore this block once Stardog fixes a regression here
    // .then(res => {
    //   // silent must always return success
    //   expect(res.status).toBe(200);
    // }));

    it('should support "clear"', () =>
      execute('insert data {:foo :bar :baz, :qux}')
        .then((res) => {
          expect(res.status).toBe(200);
          return execute('select * {:foo :bar ?o}');
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(2);
          return execute('clear all');
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute('select * {?s ?p ?o}');
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(0);
        }));

    it('should support "create"', () =>
      execute('create graph <http://my.graph>').then((res) => {
        expect(res.status).toBe(200);
      }));

    it('should support "drop"', () => {
      const graph = '<http://test.drop.graph>';
      const select = `select * { graph ${graph} { ?s ?p ?o } }`;
      return execute(`insert data { graph ${graph} {:a :b :c, :d}}`)
        .then((res) => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(2);
          return execute(`drop graph ${graph}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(0);
        });
    });

    it('should support "copy"', () => {
      const graph1 = '<http://test.graph/1>';
      const graph2 = '<http://test.graph/2>';
      return execute(`insert data { graph ${graph1} {:a :b :c, :d}}`)
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute(`select * { graph ${graph1} { ?s ?p ?o } }`),
            execute(`select * { graph ${graph2} { ?s ?p ?o } }`),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          expect(res1.body.results.bindings).toHaveLength(2);
          expect(res2.body.results.bindings).toHaveLength(0);
          return execute(`copy ${graph1} to ${graph2}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute(`select * { graph ${graph1} { ?s ?p ?o } }`),
            execute(`select * { graph ${graph2} { ?s ?p ?o } }`),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          expect(res1.body.results.bindings).toHaveLength(2);
          expect(res2.body.results.bindings).toHaveLength(2);
        });
    });

    it('should support "move"', () => {
      const graph1 = '<http://test.graph/1>';
      const graph2 = '<http://test.graph/2>';
      return execute(`insert data { graph ${graph1} {:a :b :c, :d}}`)
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute(`select * { graph ${graph1} { ?s ?p ?o } }`),
            execute(`select * { graph ${graph2} { ?s ?p ?o } }`),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          expect(res1.body.results.bindings).toHaveLength(2);
          expect(res2.body.results.bindings).toHaveLength(0);
          return execute(`move ${graph1} to ${graph2}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute(`select * { graph ${graph1} { ?s ?p ?o } }`),
            execute(`select * { graph ${graph2} { ?s ?p ?o } }`),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          expect(res1.body.results.bindings).toHaveLength(0);
          expect(res2.body.results.bindings).toHaveLength(2);
        });
    });

    it('should support "add"', () => {
      const graph1 = '<http://test.graph/1>';
      const graph2 = '<http://test.graph/2>';
      return execute(
        `insert data { graph ${graph1} {:a :b :c, :d} . graph ${graph2} {:q :w :e, :r} }`
      )
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute(`select * { graph ${graph1} { ?s ?p ?o } }`),
            execute(`select * { graph ${graph2} { ?s ?p ?o } }`),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          expect(res1.body.results.bindings).toHaveLength(2);
          expect(res2.body.results.bindings).toHaveLength(2);
          return execute(`add ${graph1} to ${graph2}`);
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute(`select * { graph ${graph1} { ?s ?p ?o } }`),
            execute(`select * { graph ${graph2} { ?s ?p ?o } }`),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          expect(res1.body.results.bindings).toHaveLength(2);
          expect(res2.body.results.bindings).toHaveLength(4);
        });
    });
  });
});
