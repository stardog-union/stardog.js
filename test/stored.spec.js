/* eslint-env jest */

const { query: { stored } } = require('../lib');
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
          return stored.delete(conn, name);
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
          return stored.delete(conn, name);
        })
        .then(res => {
          expect(res.status).toBe(204);
        });
    });
  });
});
