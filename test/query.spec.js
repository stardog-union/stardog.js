//const Stardog = require('../lib');
const Stardog = require('../lib/index2');

const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
} = require('./setup-database');

describe('query()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection({
      endpoint: 'http://localhost:5820/',
      username: 'admin',
      password: 'admin',
      reasoning: true,
      database,
    });
  });

  it('A query result should not be empty', () => {
    return conn
      .query({
        query: 'select distinct ?s where { ?s ?p ?o }',
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(10);
      });
  });

  it('A query result should work with property paths', () => {
    return conn
      .query({
        query: `select * {
          ?a a <http://localhost/vocabulary/bench/Article> ; 
               <http://purl.org/dc/elements/1.1/title> ?title ; 
               <http://purl.org/dc/elements/1.1/creator> ?c . 
          ?c (<http://xmlns.com/foaf/0.1/firstName> | <http://xmlns.com/foaf/0.1/lastName>)+ ?name
        }`,
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(6);
      });
  });

  it('A query result should not have more bindings than its intended limit', () => {
    return conn
      .query({
        query: 'select * where { ?s ?p ?o }',
        limit: 10,
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(10);
      });
  });

  it('The baseURI option should be applied to the query', () => {
    return Promise.all([
      conn.query({
        query:
          'select * {?s a <http://localhost/publications/articles/Journal1/1940/Article>}',
        limit: 10,
      }),
      conn.query({
        query: 'select * {?s a <Article>}',
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
    return conn
      .query({
        query:
          'select distinct * where { ?s a <http://localhost/vocabulary/bench/Article> }',
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to Car must have result count to 3', () => {
    return conn
      .query({
        query:
          'select distinct * where { ?s a <http://example.org/vehicles/Car> }',
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to SportsCar must have result count to 1', () => {
    return conn
      .query({
        query:
          'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }',
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(1);
      });
  });

  it('A query to Vehicles must have result count to 3', () => {
    return conn
      .query({
        query:
          'select distinct * where { ?s a <http://example.org/vehicles/Vehicle> }',
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to SportsCar must have result count to 1', () => {
    conn
      .query({
        query:
          'select distinct * where { ?s a <http://example.org/vehicles/SportsCar> }',
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(1);
      });
  });

  it('A query to Vehicles must have result count to 3', () => {
    return conn
      .query({
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to Car must have result count to 3', () => {
    return conn
      .query({
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(3);
      });
  });

  it('A query to Vehicle must have result count to 0 w/o reasoning', () => {
    return conn
      .query({
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
        reasoning: false,
      })
      .then(res => {
        expect(res.result.results.bindings).toHaveLength(0);
      });
  });
});
