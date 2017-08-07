/* eslint-env jest */

const { query, db: { transaction } } = require('../lib');

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
    }).then(res => {
      expect(res.body.results.bindings).toHaveLength(23);
    }));

  it('Should be able to query in a transaction', () =>
    begin()
      .then(res => {
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
      .then(res => {
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
      {
        reasoning: true,
      }
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(6);
    }));

  it('A query result should not have more bindings than its intended limit', () =>
    execute('select * where { ?s ?p ?o }', undefined, {
      limit: 10,
    }).then(res => {
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

  // Couldn't get this to work with Stardog 4.2.3... skipping for now
  it.skip('Very long queries should be OK', done => {
    conn.query(
      {
        database,
        // query: 'select * where { <http://localhost/publications/articles/Journal1/1940/Article1> ?p "unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary burlily thanklessly swiveled polers oinked apnea maxillary burlily thanklessly swiveled polers oinked apnea maxillary" }',
        query:
          'select * where { <http://localhost/publications/articles/Journal1/1940/Article1> ?p "unmuzzling" }',
        offset: 0,
      },
      data => {
        expect(data.results.bindings).toHaveLength(0);
        done();
      }
    );
  });

  it('A query to Articles must have result count to 3', () =>
    execute(
      'select distinct * where { ?s a <http://localhost/vocabulary/bench/Article> }'
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to Car must have result count to 3', () =>
    execute(
      'select distinct * where { ?s a <http://example.org/vehicles/Car> }',
      undefined,
      {
        reasoning: true,
      }
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to SportsCar must have result count to 1', () =>
    execute(
      'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }'
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(1);
    }));

  it('A query to Vehicles must have result count to 3', () =>
    execute(
      'select distinct * where { ?s a <http://example.org/vehicles/Vehicle> }',
      undefined,
      {
        reasoning: true,
      }
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to SportsCar must have result count to 1', () =>
    execute(
      'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }'
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(1);
    }));

  it('A query to Vehicles must have result count to 3', () =>
    execute(
      'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      undefined,
      {
        reasoning: true,
      }
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to Car must have result count to 3', () =>
    execute(
      'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
      undefined,
      {
        reasoning: true,
      }
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to Vehicle must have result count to 0 w/o reasoning', () =>
    execute(
      'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      undefined,
      {
        reasoning: false,
      }
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(0);
    }));

  it('returns a true boolean for an ASK query', () =>
    execute(
      'ask {<http://myvehicledata.com/FerrariEnzo> a <http://example.org/vehicles/SportsCar>}'
    ).then(res => {
      expect(res.body).toBe(true);
    }));

  it('returns a false boolean for an ASK query', () =>
    execute(
      'ask {<http://myvehicledata.com/FerrariEnzo> a <http://example.org/vehicles/Sedan>}'
    ).then(res => {
      expect(res.body).toBe(false);
    }));

  it('returns results for a construct query', () =>
    execute('construct where { ?s ?p ?o }').then(({ body }) => {
      expect(body).toHaveLength(26);
      for (let i = 0; i < body.length; i += 1) {
        expect(body[i]['@id'].startsWith('http://')).toBe(true);
      }
    }));
  it('returns results for a construct query as a string blob', () =>
    execute('construct where { ?s ?p ?o }', {
      accept: 'text/turtle',
    }).then(({ body }) => {
      expect(body).toHaveLength(9321);
    }));

  it('returns results as turle for descibe queries', () =>
    execute(
      'describe <http://localhost/publications/articles/Journal1/1940/Article1>',
      undefined,
      {
        limit: 1,
      }
    ).then(({ body }) => {
      expect(body[0]['@id']).toBe(
        'http://localhost/publications/articles/Journal1/1940/Article1'
      );
    }));

  describe('group_concat', () => {
    it('should return values', () =>
      execute(
        `select ?s (Group_Concat(?o ; separator=",") as ?o_s) where { ?s <#name> ?o } group by ?s`
      ).then(res => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings).toHaveLength(1);
      }));
  });

  describe('update', () => {
    afterEach(() => execute('clear all'));

    it('should support "insert data"', () =>
      execute('insert data {:foo :bar :baz}')
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toBe(null);
          return execute(`select * {:foo ?p ?o}`);
        })
        .then(res => {
          expect(res.body.results.bindings).toHaveLength(1);
        }));

    it('should support "delete data"', () => {
      const data = '<urn:foo> <urn:bar> <urn:baz>';
      const select = `select * {<urn:foo> ?p ?o}`;
      return execute(select)
        .then(res => {
          expect(res.body.results.bindings).toHaveLength(0);
          return execute(`insert data {${data}}`);
        })
        .then(res => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(1);
          return execute(`delete data {${data}}`);
        })
        .then(res => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then(res => {
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
        .then(res => {
          expect(res.status).toBe(200);
          return execute('select * {:foo :someProp ?o}');
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(1);
          expect(res.body.results.bindings[0].o.value).toBe('42');
        }));

    it('should support "delete where"', () => {
      const bgp = '{:a ?p ?o}';
      return execute('insert data {:a :b :c; :d :e; :f :g}')
        .then(res => {
          expect(res.status).toBe(200);
          return execute(`select * ${bgp}`);
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(3);
          return execute(`delete where ${bgp}`);
        })
        .then(res => {
          expect(res.status).toBe(200);
          return execute(`select * ${bgp}`);
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(0);
        });
    });

    it('should support "insert where"', () => {
      const select = 'select * {:A ?p :B}';
      return execute('insert data {:A :prop1 :B}')
        .then(res => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(1);
          return execute('insert {?s :prop2 ?o} where {?s :prop1 ?o}');
        })
        .then(res => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(2);
        });
    });

    it('should support "load"', () =>
      // Requires a publicly available RDF file, but we can test the failure case
      execute('load <http://not.a.real.website/at#all>')
        .then(res => {
          expect(res.status).toBeGreaterThanOrEqual(400);
          return execute('load silent <http://not.a.real.website/at#all>');
        })
        .then(res => {
          // silent must always return success
          expect(res.status).toBe(200);
        }));

    it('should support "clear"', () =>
      execute('insert data {:foo :bar :baz, :qux}')
        .then(res => {
          expect(res.status).toBe(200);
          return execute('select * {:foo :bar ?o}');
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(2);
          return execute('clear all');
        })
        .then(res => {
          expect(res.status).toBe(200);
          return execute('select * {?s ?p ?o}');
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(0);
        }));

    it('should support "create"', () =>
      execute('create graph <http://my.graph>').then(res => {
        expect(res.status).toBe(200);
      }));

    it('should support "drop"', () => {
      const graph = '<http://test.drop.graph>';
      const select = `select * { graph ${graph} { ?s ?p ?o } }`;
      return execute(`insert data { graph ${graph} {:a :b :c, :d}}`)
        .then(res => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(2);
          return execute(`drop graph ${graph}`);
        })
        .then(res => {
          expect(res.status).toBe(200);
          return execute(select);
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.results.bindings).toHaveLength(0);
        });
    });

    it('should support "copy"', () => {
      const graph1 = '<http://test.graph/1>';
      const graph2 = '<http://test.graph/2>';
      return execute(`insert data { graph ${graph1} {:a :b :c, :d}}`)
        .then(res => {
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
        .then(res => {
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
        .then(res => {
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
        .then(res => {
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
        .then(res => {
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
        .then(res => {
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
