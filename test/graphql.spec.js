/* eslint-env jest */

const { db, query: { graphql } } = require('../lib');
const { server } = require('../lib');
const semver = require('semver');
const {
  generateDatabaseName,
  dropDatabase,
  ConnectionFactory,
} = require('./setup-database');

const textPlan =
  'prefix : <http://api.stardog.com/>\n\nFrom all\nProjection(?0, ?1) [#1]\n`─ MergeJoin(?0) [#1]\n   +─ Scan[POSC](?0, <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>, :Character) [#1]\n   `─ Scan[PSOC](?0, :name, ?1) [#1]\n';

const jsonPlan = {
  cardinality: 1,
  children: [
    {
      cardinality: 1,
      children: [
        {
          cardinality: 1,
          children: [],
          label:
            'Scan[POSC](?0, <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>, :Character)',
        },
        {
          cardinality: 1,
          children: [],
          label: 'Scan[PSOC](?0, :name, ?1)',
        },
      ],
      label: 'MergeJoin(?0)',
    },
  ],
  label: 'Projection(?0, ?1)',
};

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
      expect(res.body.data).toBeInstanceOf(Array);
    }));

  it('updateSchema', () => {
    const simplerSchema = `type Episode {
  index: Int!
  name: String!
}`;

    graphql
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
        expect(res.body.data).toEqual({
          fields: { '0': { '1': 'name' } },
          plan: textPlan,
          sparql:
            'SELECT *\nFROM <tag:stardog:api:context:all>\n{\n?0 rdf:type :Character .\n?0 :name ?1 .\n}\n',
        });
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
      const dataset = semver.gt(
        semver.coerce(stardogVersion),
        semver.coerce('7.4.1')
      )
        ? {
            from: ['local named', 'default'],
          }
        : {
            from: ['named', 'default'],
          };
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toEqual({
        sparql:
          'SELECT *\nFROM <tag:stardog:api:context:all>\n{\n?0 rdf:type :Character .\n?0 :name ?1 .\n}\n',
        fields: { '0': { '1': 'name' } },
        // > 6.1.3 captures snapshot versions of 6.1.4
        plan: semver.gt(semver.coerce(stardogVersion), semver.coerce('6.1.3'))
          ? {
              dataset: { from: 'all' },
              plan: jsonPlan,
              prefixes: { '': 'http://api.stardog.com/' },
            }
          : textPlan,
      });
    }));
});
