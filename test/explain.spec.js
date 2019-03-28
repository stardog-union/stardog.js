/* eslint-env jest */

const { query } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('queryExplain()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('A response with the query plan should not be empty', () =>
    query
      .explain(conn, database, 'select ?s where { ?s ?p ?o } limit 10')
      .then(({ body }) => {
        expect(body).toContain('Slice(offset=0, limit=10)');
        expect(body).toContain('Projection(?s)');
        expect(body).toContain('Scan');
      }));
});

describe('json queryExplain()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('A response with the query plan should not be empty', () =>
    query
      .explain(
        conn,
        database,
        'select ?s where { ?s ?p ?o } limit 10',
        'application/json',
        {}
      )
      .then(({ body }) => {
        expect(body.plan.label).toBe('Slice(offset=0, limit=10)');
        expect(body.plan.children[0].label).toBe('Projection(?s)');
        expect(body.plan.children[0].children[0].label).toContain('Scan');
      }));
});
