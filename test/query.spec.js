/* eslint-env jest */

const { query } = require('../lib');

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

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('A query result should not be empty', () =>
    execute('select distinct ?s where { ?s ?p ?o }', {
      reasoning: true,
    }).then(res => {
      expect(res.body.results.bindings).toHaveLength(23);
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
    execute('select * where { ?s ?p ?o }', {
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
      {
        reasoning: true,
      }
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to Car must have result count to 3', () =>
    execute(
      'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
      {
        reasoning: true,
      }
    ).then(res => {
      expect(res.body.results.bindings).toHaveLength(3);
    }));

  it('A query to Vehicle must have result count to 0 w/o reasoning', () =>
    execute(
      'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
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

  it('returns results as turle for descibe queries', () =>
    execute(
      'describe <http://localhost/publications/articles/Journal1/1940/Article1>',
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
});
