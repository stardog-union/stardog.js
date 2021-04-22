/* eslint-env jest */

const { Connection, query: { stored }, server } = require('../lib');
const semver = require('semver');

const host = process.env.HOST || 'localhost';
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
      return Promise.all([
        server.status(conn, { databases: false }),
        stored.create(conn, {
          name,
          database,
          query: 'select distinct ?type {?s a ?type}',
          shared: true,
        }),
      ])
        .then(([statusRes, res]) => {
          expect(res.status).toBe(204);
          return Promise.all([statusRes, stored.list(conn)]);
        })
        .then(([statusRes, res]) => {
          const stardogVersion = statusRes.body['dbms.version'].value;
          expect(res.status).toBe(200);
          const q = res.body.queries.find(v => v.name === name);
          const earliestVersionWithReasoningAndDescription = '6.2.2';
          if (
            semver.gte(
              semver.coerce(stardogVersion),
              semver.coerce(earliestVersionWithReasoningAndDescription)
            )
          ) {
            expect(q).toEqual({
              name,
              database,
              query: 'select distinct ?type {?s a ?type}',
              shared: true,
              creator: 'admin',
              description: null,
              reasoning: false,
            });
          } else {
            expect(q).toEqual({
              name,
              database,
              query: 'select distinct ?type {?s a ?type}',
              shared: true,
              creator: 'admin',
            });
          }
        });
    });
  });
  // Covered below by `update(useUpdateMethod = false)`
  // describe('replace()', () => {});
  describe('update(useUpdateMethod = true)', () => {
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
            endpoint: `http://${host}:5820`,
          }),
          {
            name,
            database,
            query: 'select ?type { ?s a ?type }',
          },
          {}
        )
        .then(res => {
          expect(res.url).toBe(`http://${host}:5820/admin/queries/stored`);
          expect(res.status).toBe(401);
        }));
    it('returns 401 when the stardog version cannot be retrieved', () =>
      stored
        .update(
          new Connection({
            username: 'foo',
            password: 'bar',
            endpoint: `http://${host}:5820`,
          }),
          {
            name,
            database,
            query: 'select ?type { ?s a ?type }',
          },
          {}
        )
        .then(res => {
          expect(res.status).toBe(401);
        }));
  });
  describe('update(useUpdateMethod = false)', () => {
    const name = generateRandomString();
    it('inserts a new query', () =>
      stored
        .update(
          conn,
          {
            name,
            database,
            query: 'select ?type { ?s a ?type }',
          },
          {},
          false
        )
        .then(res => {
          expect(res.status).toBe(204);
        }));
    it('updates an existing query', () =>
      stored
        .update(
          conn,
          {
            name,
            database,
            query: 'select distinct ?type { ?s a ?type }',
          },
          {},
          false
        )
        .then(res => {
          expect(res.status).toBe(204);
        }));
    it('returns the delete response when theres a non 404 error', () =>
      stored
        .update(
          new Connection({
            username: 'foo',
            password: 'bar',
            endpoint: `http://${host}:5820`,
          }),
          {
            name,
            database,
            query: 'select ?type { ?s a ?type }',
          },
          {},
          false
        )
        .then(res => {
          expect(res.url).toEqual(
            expect.stringContaining(`http://${host}:5820/admin/queries/stored`)
          );
          expect(res.status).toBe(401);
        }));
    it('returns 401 when the stardog version cannot be retrieved', () =>
      stored
        .update(
          new Connection({
            username: 'foo',
            password: 'bar',
            endpoint: `http://${host}:5820`,
          }),
          {
            name,
            database,
            query: 'select ?type { ?s a ?type }',
          },
          {},
          false
        )
        .then(res => {
          expect(res.status).toBe(401);
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
