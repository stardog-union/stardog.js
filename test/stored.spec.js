/* eslint-env jest */

const { Connection, query: { stored } } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('stored', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  describe('create()', () => {
    it('creates a new stored query', () => {
      const name = generateRandomString();
      return stored
        .create(conn, {
          name,
          database,
          query: 'select distinct ?type {?s a ?type}',
        })
        .then(res => {
          expect(res.status).toBe(204);
          return stored.remove(conn, name);
        });
    });
    it('fails if the body is not correct', () =>
      stored
        .create(conn, {
          database: '*',
          query: 'select distinct ?type {?s a ?type}',
        })
        .then(res => {
          expect(res.status).toBe(400);
        }));
  });
  describe('list()', () => {
    it('returns a list of stored queries', () => {
      const name = generateRandomString();
      return stored
        .create(conn, {
          name,
          database,
          query: 'select distinct ?type {?s a ?type}',
          shared: true,
        })
        .then(res => {
          expect(res.status).toBe(204);
          return stored.list(conn);
        })
        .then(res => {
          expect(res.status).toBe(200);
          const q = res.body.queries.find(v => v.name === name);
          expect(q).toEqual({
            name,
            database,
            query: 'select distinct ?type {?s a ?type}',
            shared: true,
            creator: 'admin',
          });
        });
    });
  });
  describe('update()', () => {
    const name = generateRandomString();
    it('inserts a new query', () =>
      stored
        .update(conn, {
          name,
          database,
          query: 'select ?type { ?s a ?type }',
        })
        .then(res => {
          expect(res.status).toBe(204);
        }));
    it('updates an existing query', () =>
      stored
        .update(conn, {
          name,
          database,
          query: 'select distinct ?type { ?s a ?type }',
        })
        .then(res => {
          expect(res.status).toBe(204);
        }));
    it('returns the delete response when theres a non 404 error', () =>
      stored
        .update(
          new Connection({
            username: 'foo',
            password: 'bar',
            endpoint: 'http://localhost:5820',
          }),
          {
            name,
            database,
            query: 'select ?type { ?s a ?type }',
          },
          {},
          '6.2.1'
        )
        .then(res => {
          expect(res.url).toBe('http://localhost:5820/admin/queries/stored');
          expect(res.status).toBe(401);
        }));
    it('returns null when the stardog version cannot be retrieved', () =>
      stored
        .update(
          new Connection({
            username: 'foo',
            password: 'bar',
            endpoint: 'http://localhost:5820',
          }),
          {
            name,
            database,
            query: 'select ?type { ?s a ?type }',
          },
          {}
        )
        .then(res => {
          expect(res).toBe(null);
        }));
  });
  describe('delete()', () => {
    it('removes a stored query', () => {
      const name = generateRandomString();
      return stored
        .create(conn, {
          name,
          database,
          query: 'select distinct ?type {?s a ?type}',
        })
        .then(res => {
          expect(res.status).toBe(204);
          return stored.remove(conn, name);
        })
        .then(res => {
          expect(res.status).toBe(204);
        });
    });
  });
});
