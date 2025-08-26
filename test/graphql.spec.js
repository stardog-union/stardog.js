/* eslint-env jest */

const { db, query: { graphql } } = require('../lib');
const { server } = require('../lib');
const semver = require('semver');
const {
  generateDatabaseName,
  dropDatabase,
  ConnectionFactory,
} = require('./setup-database');

describe('graphql', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();
  const schemaName = 'mySchema';
  const aSimpleSchema = `schema {
    query: QueryType
}

type QueryType {
    Character: Character
    Human(id: Int, first: Int, skip: Int, orderBy: ID): Human
    Droid(id: Int): Droid
}

interface Character {
    id: Int!
    name: String!
    friends(id: Int): [Character]
    appearsIn: [Episode]
}

type Human implements Character {
    iri: ID!
    id: Int!
    name: String!
    friends(id: Int): [Character]
    appearsIn: [Episode]
}

type Droid implements Character {
    id: Int!
    name: String!
    friends(id: Int): [Character]
    appearsIn: [Episode]
    primaryFunction: String
}

type Episode {
  index: Int!
  name: String!
}`;

  // Tests addSchema and ensures the other tests have it
  beforeAll(() =>
    db
      .create(conn, database)
      .then(res => {
        expect(res.status).toBe(201);
        return graphql.addSchema(conn, database, schemaName, aSimpleSchema);
      })
      .then(res => {
        expect(res.status).toBe(201);
      })
  );

  // Tests removeSchema/clearSchemas just once
  afterAll(() =>
    graphql
      .removeSchema(conn, database, schemaName)
      .then(res => {
        expect(res.status).toBe(204);
        return graphql.clearSchemas(conn, database);
      })
      .then(res => {
        expect(res.status).toBe(204);
        return dropDatabase(database);
      })
  );

  it('listSchemas', () =>
    graphql.listSchemas(conn, database).then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('schemas');
      expect(res.body.schemas).toContain(schemaName);
    }));

  it('getSchema', () =>
    graphql.getSchema(conn, database, schemaName).then(res => {
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    }));

  it('execute', () =>
    graphql.execute(conn, database, `{ Character { name }}`).then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    }));

  it('updateSchema', () => {
    const simplerSchema = `schema {
  query: QueryType
}

type QueryType {
  Episode: Episode
}

type Episode {
  index: Int!
  name: String!
}`;

    return graphql
      .updateSchema(conn, database, schemaName, simplerSchema)
      .then(res => {
        expect(res.status).toBe(200);
        graphql.getSchema(conn, database, schemaName).then(response => {
          expect(response.status).toBe(200);
          expect(response.body.length).toBe(simplerSchema.length);
        });
      });
  });

  it('explainAsJson=false', () =>
    Promise.all([
      server.status(conn, { databases: false }),
      graphql.execute(conn, database, '{ Character { name }}', {
        '@explain': true,
        '@explainAsJson': false,
      }),
    ]).then(results => {
      const [statusRes, res] = results;
      const stardogVersion = statusRes.body['dbms.version'].value;
      // > 6.1.3 captures snapshot versions of 6.1.4
      if (semver.gt(semver.coerce(stardogVersion), semver.coerce('6.1.3'))) {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data.fields).toEqual({
          0: {
            1: 'name',
          },
        });
        expect(res.body.data.plan.includes('Projection(?0, ?1)')).toBe(true);
        expect(res.body.data.sparql).toBe(
          'SELECT *\nFROM <tag:stardog:api:context:local>\n{\n?0 rdf:type :Character .\n?0 :name ?1 .\n}\n'
        );
      } else {
        // Argument is not supported before 6.1.4
        expect(res.status).toBe(400);
      }
    }));

  it('explain', () =>
    Promise.all([
      server.status(conn, { databases: false }),
      graphql.execute(conn, database, '{ Character { name }}', {
        '@explain': true,
      }),
    ]).then(results => {
      const [statusRes, res] = results;
      const stardogVersion = statusRes.body['dbms.version'].value;
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.fields).toEqual({
        0: {
          1: 'name',
        },
      });
      if (semver.gt(semver.coerce(stardogVersion), semver.coerce('6.1.3'))) {
        expect(res.body.data.plan).toHaveProperty('dataset');
        expect(res.body.data.plan).toHaveProperty('prefixes');
        expect(res.body.data.plan.plan).toHaveProperty('cardinality');
        expect(() => JSON.stringify(res.body.data.plan.plan)).not.toThrow();
      } else {
        expect(res.body.data.plan.includes('Projection(?0, ?1)')).toBe(true);
      }
      expect(res.body.data.sparql).toBe(
        'SELECT *\nFROM <tag:stardog:api:context:local>\n{\n?0 rdf:type :Character .\n?0 :name ?1 .\n}\n'
      );
    }));
});
