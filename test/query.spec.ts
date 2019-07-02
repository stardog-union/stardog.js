import { query, db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';
import { RequestHeader, ContentType } from '../lib/constants';

const { transaction } = db;

type QueryExecuteParams = Parameters<typeof query.execute>[0];

describe('query.execute({ query:)', () => {
  const database = generateDatabaseName();
  const connection = ConnectionFactory();
  const execute = (
    executeData: Omit<QueryExecuteParams, 'connection' | 'database'>
  ) => query.execute({ ...executeData, connection, database });
  const begin: () => Promise<any> = transaction.begin.bind(null, {
    connection,
    database,
  });

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('A query result should not be empty', () =>
    execute({
      query: 'select distinct ?s where { ?s ?p ?o }',
      params: {
        reasoning: true,
      },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(31)));

  it('Should be able to query in a transaction', () =>
    begin()
      .then((res) => {
        expect(res.status).toEqual(200);
        return query.executeInTransaction({
          connection,
          database,
          transactionId: res.transactionId,
          query: 'select distinct ?s where { ?s ?p ?o }',
          params: { limit: 10 },
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body.results.bindings).toHaveLength(10)));

  it('A query result should work with property paths', () =>
    execute({
      query: `select * {
          ?a a <http://localhost/vocabulary/bench/Article> ; 
               <http://purl.org/dc/elements/1.1/title> ?title ; 
               <http://purl.org/dc/elements/1.1/creator> ?c . 
          ?c (<http://xmlns.com/foaf/0.1/firstName> | <http://xmlns.com/foaf/0.1/lastName>)+ ?name
        }`,
      params: {
        reasoning: true,
      },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(6)));

  it('A query result should not have more bindings than its intended limit', () =>
    execute({
      query: 'select * where { ?s ?p ?o }',
      params: {
        limit: 10,
      },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(10)));

  it('The baseURI option should be applied to the query', () =>
    Promise.all([
      execute({
        query:
          'select * {?s a <http://localhost/publications/articles/Journal1/1940/Article>}',
        params: {
          limit: 10,
        },
      }),
      execute({
        query: 'select * {?s a <Article>}',
        params: {
          baseURI: 'http://localhost/publications/articles/Journal1/1940/',
          limit: 10,
        },
      }),
    ])
      .then(([noBase, base]) => Promise.all([noBase.json(), base.json()]))
      .then(([noBase, base]) => expect(noBase).toEqual(base)));

  it('Very long queries should be OK', () => {
    execute({
      query:
        'select * where { <http://localhost/publications/articles/Journal1/1940/Article1> ?p "unmuzzling" }',
      params: { offset: 0 },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(0));
  });

  it('A query to Articles must have result count to 3', () =>
    execute({
      query:
        'select distinct * where { ?s a <http://localhost/vocabulary/bench/Article> }',
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(3)));

  it('A query to Car must have result count to 3', () =>
    execute({
      query:
        'select distinct * where { ?s a <http://example.org/vehicles/Car> }',
      params: {
        reasoning: true,
      },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(3)));

  it('A query to SportsCar must have result count to 1', () =>
    execute({
      query:
        'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }',
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(1)));

  it('A query to Vehicles must have result count to 3', () =>
    execute({
      query:
        'select distinct * where { ?s a <http://example.org/vehicles/Vehicle> }',
      params: {
        reasoning: true,
      },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(3)));

  it('A query to SportsCar must have result count to 1', () =>
    execute({
      query:
        'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }',
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(1)));

  it('A query to Vehicles must have result count to 3', () =>
    execute({
      query:
        'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      params: {
        reasoning: true,
      },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(3)));

  it('A query to Car must have result count to 3', () =>
    execute({
      query:
        'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
      params: {
        reasoning: true,
      },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(3)));

  it('A query to Vehicle must have result count to 0 w/o reasoning', () =>
    execute({
      query:
        'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      params: {
        reasoning: false,
      },
    })
      .then((res) => res.json())
      .then((body) => expect(body.results.bindings).toHaveLength(0)));

  it('returns a true boolean for an ASK query', () =>
    execute({
      query:
        'ask {<http://myvehicledata.com/FerrariEnzo> a <http://example.org/vehicles/SportsCar>}',
    })
      .then((res) => res.json())
      .then((body) => expect(body).toBe(true)));

  it('returns a false boolean for an ASK query', () =>
    execute({
      query:
        'ask {<http://myvehicledata.com/FerrariEnzo> a <http://example.org/vehicles/Sedan>}',
    })
      .then((res) => res.json())
      .then((body) => expect(body).toBe(false)));

  it('returns results for a construct query as json-ld', () =>
    execute({
      query: 'construct where { ?s ?p ?o }',
      requestHeaders: { [RequestHeader.ACCEPT]: ContentType.LD_JSON },
    })
      .then((res) => res.json())
      .then((body) => {
        expect(body).toHaveLength(33);
        for (let i = 0; i < body.length; i += 1) {
          expect(body[i]['@id']).not.toBeNull();
        }
      }));

  it('returns results for a construct query as a string blob', () =>
    execute({ query: 'construct where { ?s ?p ?o }' })
      .then((res) => res.text())
      .then((body) => {
        expect(body).toContain(
          '<http://localhost/persons/John_Erdoes> a <http://xmlns.com/foaf/0.1/Person> .'
        );
      }));

  it('returns results for a describe query as a string blob', () =>
    execute({
      query:
        'describe <http://localhost/publications/articles/Journal1/1940/Article1>',
      params: {
        limit: 1,
      },
    })
      .then((res) => res.text())
      .then((body) => {
        expect(body).toContain(
          '<http://swrc.ontoware.org/ontology#journal> <http://localhost/publications/journals/Journal1/1940> ;\n'
        );
        expect(body).toHaveLength(1924);
      }));

  describe('group_concat', () => {
    it('should return values', () =>
      execute({
        query: `select ?s (Group_Concat(?o ; separator=",") as ?o_s) where { ?s <#name> ?o } group by ?s`,
      })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(1)));
  });

  describe('paths', () => {
    const prefixes = 'prefix : <urn:paths:> ';
    it('should run a simple paths query', () =>
      execute({ query: `${prefixes} paths start ?x = :Alice end ?y via ?p` })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(11)));

    it('should run a more specific query', () =>
      execute({
        query: `${prefixes} paths start ?x = :Alice end ?y = :David via :knows`,
      })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(2)));

    it('should run a complex query', () =>
      execute({
        query: `${prefixes} paths start ?x = :Alice end ?y = :David via { {?x ?p ?y} union {?y ?p ?x} }`,
      })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(2)));

    it('should return all paths', () =>
      execute({
        query: `${prefixes} paths all start ?x = :Alice end ?y = :David via { {?x ?p ?y} union {?y ?p ?x} }`,
      })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(7)));

    it('should return cyclic paths', () =>
      execute({
        query: `${prefixes} paths cyclic start ?start end ?end via :dependsOn`,
      })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(17)));

    it('runs queries with a limit', () =>
      execute({
        query: `${prefixes} paths start ?x = :Alice end ?y via ?p limit 2`,
      })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(4)));

    it('runs queries with a max length', () =>
      execute({
        query: `${prefixes} paths start ?x = :Alice end ?y via ?p max length 2`,
      })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(7)));
  });

  describe('update', () => {
    afterEach(() => execute({ query: 'clear all' }));

    it('should support "insert data"', () =>
      execute({ query: 'insert data {:foo :bar :baz}' })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.text();
        })
        .then((body) => {
          expect(body).toBe('');
          return execute({ query: `select * {:foo ?p ?o}` });
        })
        .then((res) => res.json())
        .then((body) => expect(body.results.bindings).toHaveLength(1)));

    it('should support "delete data"', () => {
      const data = '<urn:foo> <urn:bar> <urn:baz>';
      const select = `select * {<urn:foo> ?p ?o}`;
      return execute({ query: select })
        .then((res) => res.json())
        .then((body) => {
          expect(body.results.bindings).toHaveLength(0);
          return execute({ query: `insert data {${data}}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: select });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body.results.bindings).toHaveLength(1);
          return execute({ query: `delete data {${data}}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: select });
        })
        .then((res) => res.json())
        .then((body) => expect(body.results.bindings).toHaveLength(0));
    });

    it('should support "delete/insert"', () =>
      execute({ query: `insert data {:foo :someProp 0}` })
        .then(() =>
          execute({
            query: `
          delete {?s :someProp ?o}
          insert {?s :someProp 42}
          where {?s :someProp ?o}
        `,
          })
        )
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: 'select * {:foo :someProp ?o}' });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body.results.bindings).toHaveLength(1);
          expect(body.results.bindings[0].o.value).toBe('42');
        }));

    it('should support "delete where"', () => {
      const bgp = '{:a ?p ?o}';
      return execute({ query: 'insert data {:a :b :c; :d :e; :f :g}' })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: `select * ${bgp}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body.results.bindings).toHaveLength(3);
          return execute({ query: `delete where ${bgp}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: `select * ${bgp}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(0));
    });

    it('should support "insert where"', () => {
      const select = 'select * {:A ?p :B}';
      return execute({ query: 'insert data {:A :prop1 :B}' })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: select });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body.results.bindings).toHaveLength(1);
          return execute({
            query: 'insert {?s :prop2 ?o} where {?s :prop1 ?o}',
          });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: select });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(2));
    });

    it('should support "load"', () =>
      // Requires a publicly available RDF file, but we can test the failure case
      execute({ query: 'load <http://not.a.real.website/at#all>' })
        .then((res) => {
          expect(res.status).toBeGreaterThanOrEqual(400);
          return execute({
            query: 'load silent <http://not.a.real.website/at#all>',
          });
        })
        .then((res) => {
          // silent must always return success
          expect(res.status).toBe(200);
        }));

    it('should support "clear"', () =>
      execute({ query: 'insert data {:foo :bar :baz, :qux}' })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: 'select * {:foo :bar ?o}' });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body.results.bindings).toHaveLength(2);
          return execute({ query: 'clear all' });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: 'select * {?s ?p ?o}' });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(0)));

    it('should support "create"', () =>
      execute({ query: 'create graph <http://my.graph>' }).then((res) => {
        expect(res.status).toBe(200);
      }));

    it('should support "drop"', () => {
      const graph = '<http://test.drop.graph>';
      const select = `select * { graph ${graph} { ?s ?p ?o } }`;
      return execute({ query: `insert data { graph ${graph} {:a :b :c, :d}}` })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: select });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          expect(body.results.bindings).toHaveLength(2);
          return execute({ query: `drop graph ${graph}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return execute({ query: select });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => expect(body.results.bindings).toHaveLength(0));
    });

    it('should support "copy"', () => {
      const graph1 = '<http://test.graph/1>';
      const graph2 = '<http://test.graph/2>';
      return execute({ query: `insert data { graph ${graph1} {:a :b :c, :d}}` })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute({ query: `select * { graph ${graph1} { ?s ?p ?o } }` }),
            execute({ query: `select * { graph ${graph2} { ?s ?p ?o } }` }),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          return Promise.all([res1.json(), res2.json()]);
        })
        .then(([body1, body2]) => {
          expect(body1.results.bindings).toHaveLength(2);
          expect(body2.results.bindings).toHaveLength(0);
          return execute({ query: `copy ${graph1} to ${graph2}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute({ query: `select * { graph ${graph1} { ?s ?p ?o } }` }),
            execute({ query: `select * { graph ${graph2} { ?s ?p ?o } }` }),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          return Promise.all([res1.json(), res2.json()]);
        })
        .then(([body1, body2]) => {
          expect(body1.results.bindings).toHaveLength(2);
          expect(body2.results.bindings).toHaveLength(2);
        });
    });

    it('should support "move"', () => {
      const graph1 = '<http://test.graph/1>';
      const graph2 = '<http://test.graph/2>';
      return execute({ query: `insert data { graph ${graph1} {:a :b :c, :d}}` })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute({ query: `select * { graph ${graph1} { ?s ?p ?o } }` }),
            execute({ query: `select * { graph ${graph2} { ?s ?p ?o } }` }),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          return Promise.all([res1.json(), res2.json()]);
        })
        .then(([body1, body2]) => {
          expect(body1.results.bindings).toHaveLength(2);
          expect(body2.results.bindings).toHaveLength(0);
          return execute({ query: `move ${graph1} to ${graph2}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute({ query: `select * { graph ${graph1} { ?s ?p ?o } }` }),
            execute({ query: `select * { graph ${graph2} { ?s ?p ?o } }` }),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          return Promise.all([res1.json(), res2.json()]);
        })
        .then(([body1, body2]) => {
          expect(body1.results.bindings).toHaveLength(0);
          expect(body2.results.bindings).toHaveLength(2);
        });
    });

    it('should support "add"', () => {
      const graph1 = '<http://test.graph/1>';
      const graph2 = '<http://test.graph/2>';
      return execute({
        query: `insert data { graph ${graph1} {:a :b :c, :d} . graph ${graph2} {:q :w :e, :r} }`,
      })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute({ query: `select * { graph ${graph1} { ?s ?p ?o } }` }),
            execute({ query: `select * { graph ${graph2} { ?s ?p ?o } }` }),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          return Promise.all([res1.json(), res2.json()]);
        })
        .then(([body1, body2]) => {
          expect(body1.results.bindings).toHaveLength(2);
          expect(body2.results.bindings).toHaveLength(2);
          return execute({ query: `add ${graph1} to ${graph2}` });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return Promise.all([
            execute({ query: `select * { graph ${graph1} { ?s ?p ?o } }` }),
            execute({ query: `select * { graph ${graph2} { ?s ?p ?o } }` }),
          ]);
        })
        .then(([res1, res2]) => {
          expect(res1.status).toBe(200);
          expect(res2.status).toBe(200);
          return Promise.all([res1.json(), res2.json()]);
        })
        .then(([body1, body2]) => {
          expect(body1.results.bindings).toHaveLength(2);
          expect(body2.results.bindings).toHaveLength(4);
        });
    });
  });
});
