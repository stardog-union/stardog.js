import { db, query, server } from '../lib';
import * as semver from 'semver';
import {
  generateDatabaseName,
  dropDatabase,
  ConnectionFactory,
} from './setup-database';

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
  const connection = ConnectionFactory();
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
      .create({ connection, database })
      .then((res) => {
        expect(res.status).toBe(201);
        return query.graphql.addSchema({
          connection,
          database,
          name: schemaName,
          schema: aSimpleSchema,
        });
      })
      .then((res) => {
        expect(res.status).toBe(201);
      })
  );

  // Tests removeSchema/clearSchemas just once
  afterAll(() =>
    query.graphql
      .removeSchema({ connection, database, name: schemaName })
      .then((res) => {
        expect(res.status).toBe(204);
        return query.graphql.clearSchemas({ connection, database });
      })
      .then((res) => {
        expect(res.status).toBe(204);
        return dropDatabase(database);
      })
      .catch((err) => {
        dropDatabase(database);
        throw err;
      })
  );

  it('listSchemas', () =>
    query.graphql
      .listSchemas({ connection, database })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => {
        expect(body).toHaveProperty('schemas');
        expect(body.schemas).toContain(schemaName);
      }));

  it('getSchema', () =>
    query.graphql
      .getSchema({ connection, database, name: schemaName })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => expect(text.length).toBeGreaterThan(0)));

  it('execute', () =>
    query.graphql
      .execute({ connection, database, query: `{ Character { name }}` })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => {
        expect(body).toHaveProperty('data');
        expect(body.data).toBeInstanceOf(Array);
      }));

  it('explainAsJson=false', () =>
    Promise.all([
      server.status({ connection, params: { databases: false } }),
      query.graphql.execute({
        connection,
        database,
        query: '{ Character { name }}',
        variables: {
          '@explain': true,
          '@explainAsJson': false,
        },
      }),
    ]).then((results) => {
      const [statusRes, res] = results;
      return Promise.all([statusRes.json(), res.json()]).then(
        ([statusBody, resBody]) => {
          const stardogVersion = statusBody['dbms.version'].value;
          // > 6.1.3 captures snapshot versions of 6.1.4
          if (semver.gt(stardogVersion, '6.1.3')) {
            expect(res.status).toBe(200);
            expect(resBody).toHaveProperty('data');
            expect(resBody.data).toEqual({
              fields: { '0': { '1': 'name' } },
              plan: textPlan,
              sparql:
                'SELECT *\nFROM <tag:stardog:api:context:all>\n{\n?0 rdf:type :Character .\n?0 :name ?1 .\n}\n',
            });
          } else {
            // Argument is not supported before 6.1.4
            expect(res.status).toBe(400);
          }
        }
      );
    }));

  it('explain', () =>
    Promise.all([
      server.status({ connection, params: { databases: false } }),
      query.graphql.execute({
        connection,
        database,
        query: '{ Character { name }}',
        variables: {
          '@explain': true,
        },
      }),
    ]).then((results) => {
      const [statusRes, res] = results;
      return Promise.all([statusRes.json(), res.json()]).then(
        ([statusBody, resBody]) => {
          const stardogVersion = statusBody['dbms.version'].value;
          expect(res.status).toBe(200);
          expect(resBody).toHaveProperty('data');
          expect(resBody.data).toEqual({
            sparql:
              'SELECT *\nFROM <tag:stardog:api:context:all>\n{\n?0 rdf:type :Character .\n?0 :name ?1 .\n}\n',
            fields: { '0': { '1': 'name' } },
            // > 6.1.3 captures snapshot versions of 6.1.4
            plan: semver.gt(stardogVersion, '6.1.3')
              ? {
                  dataset: { from: 'all' },
                  plan: jsonPlan,
                  prefixes: { '': 'http://api.stardog.com/' },
                }
              : textPlan,
          });
        }
      );
    }));
});
