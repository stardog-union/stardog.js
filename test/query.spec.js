const { query } = require('../lib');

const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('query.execute()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({ database });
  });

  it('A query result should not be empty', () => {
    return query
      .execute(conn, 'select distinct ?s where { ?s ?p ?o }', {
        reasoning: true,
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(10);
      });
  });

  it('A query result should work with property paths', () => {
    return query
      .execute(
        conn,
        `select * {
          ?a a <http://localhost/vocabulary/bench/Article> ; 
               <http://purl.org/dc/elements/1.1/title> ?title ; 
               <http://purl.org/dc/elements/1.1/creator> ?c . 
          ?c (<http://xmlns.com/foaf/0.1/firstName> | <http://xmlns.com/foaf/0.1/lastName>)+ ?name
        }`,
        {
          reasoning: true,
        }
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(6);
      });
  });

  it('A query result should not have more bindings than its intended limit', () => {
    return query
      .execute(conn, 'select * where { ?s ?p ?o }', {
        limit: 10,
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(10);
      });
  });

  it('The baseURI option should be applied to the query', () => {
    return Promise.all([
      query.execute(
        conn,
        'select * {?s a <http://localhost/publications/articles/Journal1/1940/Article>}',
        {
          limit: 10,
        }
      ),
      query.execute(conn, 'select * {?s a <Article>}', {
        baseURI: 'http://localhost/publications/articles/Journal1/1940/',
        limit: 10,
      }),
    ]).then(([noBase, base]) => {
      expect(noBase).toEqual(base);
    });
  });

  // Couldn't get this to work with Stardog 4.2.3... skipping for now
  it.skip('Very long queries should be OK', done => {
    conn.query(
      {
        database,
        //query: 'select * where { <http://localhost/publications/articles/Journal1/1940/Article1> ?p "unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary dumpers bering evasiveness toto teashop reaccepts gunneries exorcises pirog desexes summable heliocentricity excretions recelebrating dually plateauing reoccupations embossers cerebrum gloves mohairs admiralties bewigged playgoers cheques batting waspishly stilbestrol villainousness miscalling firefanged skeins equalled sandwiching bewitchment cheaters riffled kerneling napoleons rifer unmuzzling measles decentralizing hogfishes gantleted richer succories dwelling scrapped prat islanded burlily thanklessly swiveled polers oinked apnea maxillary burlily thanklessly swiveled polers oinked apnea maxillary burlily thanklessly swiveled polers oinked apnea maxillary" }',
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

  it('A query to Articles must have result count to 3', () => {
    return query
      .execute(
        conn,
        'select distinct * where { ?s a <http://localhost/vocabulary/bench/Article> }'
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to Car must have result count to 3', () => {
    return query
      .execute(
        conn,
        'select distinct * where { ?s a <http://example.org/vehicles/Car> }',
        {
          reasoning: true,
        }
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to SportsCar must have result count to 1', () => {
    return query
      .execute(
        conn,
        'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }'
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(1);
      });
  });

  it('A query to Vehicles must have result count to 3', () => {
    return query
      .execute(
        conn,
        'select distinct * where { ?s a <http://example.org/vehicles/Vehicle> }',
        {
          reasoning: true,
        }
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to SportsCar must have result count to 1', () => {
    return query
      .execute(
        conn,
        'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }'
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(1);
      });
  });

  it('A query to Vehicles must have result count to 3', () => {
    return query
      .execute(
        conn,
        'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
        {
          reasoning: true,
        }
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to Car must have result count to 3', () => {
    return query
      .execute(
        conn,
        'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
        {
          reasoning: true,
        }
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to Vehicle must have result count to 0 w/o reasoning', () => {
    return query
      .execute(
        conn,
        'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
        {
          reasoning: false,
        }
      )
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(0);
      });
  });

  it('returns a true boolean for an ASK query', () => {
    return query
      .execute(
        conn,
        'ask {<http://myvehicledata.com/FerrariEnzo> a <http://example.org/vehicles/SportsCar>}'
      )
      .then(res => {
        expect(res.result).toBe(true);
      });
  });

  it('returns a false boolean for an ASK query', () => {
    return query
      .execute(
        conn,
        'ask {<http://myvehicledata.com/FerrariEnzo> a <http://example.org/vehicles/Sedan>}'
      )
      .then(res => {
        expect(res.result).toBe(false);
      });
  });

  it('returns results for a construct query', () => {
    return query
      .execute(conn, 'construct where { ?s ?p ?o }')
      .then(({ result }) => {
        expect(result).toHaveLength(12); // three articles defined in nodeDB
        for (let i = 0; i < result.length; i++) {
          expect(result[i]['@id'].startsWith('http://')).toBe(true);
        }
      });
  });

  describe('turtle', () => {
    it('returns results as turle for descibe queries', () => {
      return query
        .turtle(
          conn,
          'describe <http://localhost/publications/articles/Journal1/1940/Article1>',
          {
            limit: 1,
          }
        )
        .then(({ result }) => {
          expect(result).toContain(
            '<http://localhost/publications/articles/Journal1/1940/Article1>'
          );
        });
    });
    it('rejects with a type error for unacceptable query types', () => {
      expect(() => {
        query.turtle(conn, 'select distinct ?s where { ?s ?p ?o }');
      }).toThrowError(TypeError);
    });
  });

  describe('group_concat', () => {
    it('should return values', () => {
      return query
        .execute(
          conn,
          `select ?s (Group_Concat(?o ; separator=",") as ?o_s) where { ?s <#name> ?o } group by ?s`
        )
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.result.results.bindings).toHaveLength(1);
        });
    });
  });
});
