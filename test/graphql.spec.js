/* eslint-env jest */

const { db, query: { graphql } } = require('../lib');
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
      expect(res.body.data).toBeInstanceOf(Array);
    }));
});
