const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
} = require('./setup-database');

describe('query()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
    conn.setReasoning(true);
  });

  it('A query result should not be empty', done => {
    conn.onlineDB({ database, strategy: 'NO_WAIT' }, () => {
      conn.query(
        {
          database,
          query: 'select distinct ?s where { ?s ?p ?o }',
        },
        data => {
          expect(data.results.bindings).toHaveLength(10);
          done();
        }
      );
    });
  });

  it('A query result should work with property paths', done => {
    conn.onlineDB({ database, strategy: 'NO_WAIT' }, () => {
      conn.query(
        {
          database,
          query:
            'prefix prov: <http://www.w3.org/ns/prov#>\n' +
              'select distinct ?s ?sLabel ?sType ?sTypeLabel ?p ?pLabel ?o ?oLabel ?oType ?oTypeLabel where {\n' +
              '  VALUES ?basicProvProperties { prov:wasGeneratedBy prov:wasDerivedFrom prov:wasAttributedTo prov:startedAtTime prov:used prov:wasInformedBy prov:endedAtTime prov:wasAssociatedWith prov:actedOnBehalfOf prov:alternateOf prov:specializationOf prov:generatedAtTime prov:hadPrimarySource prov:value prov:wasQuotedFrom prov:wasRevisionOf prov:invalidatedAtTime prov:wasInvalidatedBy prov:hadMember prov:wasStartedBy prov:wasEndedBy prov:invalidated prov:influenced prov:atLocation prov:generated prov:wasInfluencedBy prov:qualifiedInfluence prov:qualifiedGeneration prov:qualifiedDerivation prov:qualifiedPrimarySource prov:qualifiedQuotation prov:qualifiedRevision prov:qualifiedAttribution prov:qualifiedInvalidation prov:qualifiedStart prov:qualifiedUsage prov:qualifiedCommunication prov:qualifiedAssociation prov:qualifiedEnd prov:qualifieddropgation prov:influencer prov:entity prov:hadUsage prov:hadGeneration prov:activity prov:agent prov:hadPlan prov:hadActivity prov:atTime prov:hadRole }\n' +
              '         <http://www.example.org#chart2> (prov:wasGeneratedBy | prov:wasDerivedFrom | prov:wasAttributedTo | prov:startedAtTime | prov:used | prov:wasInformedBy | prov:endedAtTime | prov:wasAssociatedWith | prov:actedOnBehalfOf | prov:alternateOf | prov:specializationOf | prov:generatedAtTime | prov:hadPrimarySource | prov:value | prov:wasQuotedFrom | prov:wasRevisionOf | prov:invalidatedAtTime | prov:wasInvalidatedBy | prov:hadMember | prov:wasStartedBy | prov:wasEndedBy | prov:invalidated | prov:influenced | prov:atLocation | prov:generated | prov:wasInfluencedBy | prov:qualifiedInfluence | prov:qualifiedGeneration | prov:qualifiedDerivation | prov:qualifiedPrimarySource | prov:qualifiedQuotation | prov:qualifiedRevision | prov:qualifiedAttribution | prov:qualifiedInvalidation | prov:qualifiedStart | prov:qualifiedUsage | prov:qualifiedCommunication | prov:qualifiedAssociation | prov:qualifiedEnd | prov:qualifiedDelegation | prov:influencer | prov:entity | prov:hadUsage | prov:hadGeneration | prov:activity | prov:agent | prov:hadPlan | prov:hadActivity | prov:atTime | prov:hadRole)+ ?o .\n' +
              '  ?s ?basicProvProperties ?o .\n' +
              '  ?s ?p ?o .\n' +
              '  OPTIONAL{ ?s rdfs:label ?sLabel }\n' +
              '  OPTIONAL { ?p rdfs:label ?pLabel } \n' +
              '  OPTIONAL{ ?o rdfs:label ?oLabel }\n' +
              '  OPTIONAL { ?s rdf:type ?sType .\n' +
              '            OPTIONAL { ?sType rdfs:label ?sTypeLabel . }\n' +
              '           }\n' +
              '  OPTIONAL { ?o rdf:type ?oType .\n' +
              '            OPTIONAL { ?oType rdfs:label ?oTypeLabel . }\n' +
              '           }' +
              '}',
        },
        data => {
          expect(data.results.bindings).toEqual(expect.anything());
          done();
        }
      );
    });
  });

  it('A query result should not have more bindings than its intended limit', done => {
    conn.onlineDB({ database, strategy: 'NO_WAIT' }, () => {
      conn.query(
        {
          database,
          query: 'select * where { ?s ?p ?o }',
          limit: 10,
          offset: 0,
        },
        data => {
          expect(data.results.bindings).toHaveLength(10);
          done();
        }
      );
    });
  });

  it('The baseURI option should be applied to the query', done => {
    conn.onlineDB({ database, strategy: 'NO_WAIT' }, () => {
      conn.query(
        {
          database,
          query: 'select * where { <Article1> ?p ?o }',
          baseURI: 'http://localhost/publications/articles/Journal1/1940/',
          limit: 10,
          offset: 0,
        },
        data => {
          expect(data.results.bindings).toHaveLength(10);
          done();
        }
      );
    });
  });

  // Couldn't get this to work with Stardog 4.2.3... skipping for now
  it.skip('Very long queries should be OK', done => {
    conn.onlineDB({ database, strategy: 'NO_WAIT' }, () => {
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
  });

  it('A query to Vehicles must have result count to 3', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });

  it('A query to Car must have result count to 3', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });

  it('A query to SportsCar must have result count to 1', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/SportsCar> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(1);
        done();
      }
    );
  });

  it('A query to Vehicles must have result count to 3', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });

  it('A query to Car must have result count to 3', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });

  it('A query to SportsCar must have result count to 1', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/SportsCar> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(1);
        done();
      }
    );
  });

  it('A query to Vehicles must have result count to 3', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });

  it('A query to Car must have result count to 3', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });

  it('A query to SportsCar must have result count to 1', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/SportsCar> }',
      },
      data => {
        expect(data.results.bindings).toHaveLength(1);
        done();
      }
    );
  });
  it('A query to Vehicles must have result count to 3', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
        reasoning: true,
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });

  it('A query to Car must have result count to 3', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Car> }',
        reasoning: true,
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });

  it('A query to Vehicle must have result count to 3 w/o reasoning', done => {
    conn.query(
      {
        database,
        query:
          'select distinct ?s where { ?s a <http://example.org/vehicles/Vehicle> }',
        reasoning: false,
      },
      data => {
        expect(data.results.bindings).toHaveLength(3);
        done();
      }
    );
  });
});
