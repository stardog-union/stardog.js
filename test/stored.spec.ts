import { query } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

const { stored } = query;

describe('stored', () => {
  const database = generateDatabaseName();
  const connection = ConnectionFactory();

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  describe('create()', () => {
    it('creates a new stored query', () => {
      const name = generateRandomString();
      return stored
        .create({
          connection,
          storedQueryData: {
            name,
            database,
            query: 'select distinct ?type {?s a ?type}',
          },
        })
        .then((res) => {
          expect(res.status).toBe(204);
          return stored.deleteStoredQuery({ connection, storedQuery: name });
        });
    });

    it('fails if the body is not correct', () =>
      stored
        .create({
          connection,
          // @ts-ignore: intentionally incorrect body
          storedQueryData: {
            database: '*',
            query: 'select distinct ?type {?s a ?type}',
          },
        })
        .then((res) => {
          expect(res.status).toBe(400);
        }));
  });

  describe('list()', () => {
    it('returns a list of stored queries', () => {
      const name = generateRandomString();
      return stored
        .create({
          connection,
          storedQueryData: {
            name,
            database,
            query: 'select distinct ?type {?s a ?type}',
            shared: true,
          },
        })
        .then((res) => {
          expect(res.status).toBe(204);
          return stored.list({ connection });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          const q = body.queries.find((v) => v.name === name);
          expect(q).toEqual({
            name,
            database,
            description: null,
            query: 'select distinct ?type {?s a ?type}',
            reasoning: false,
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
        .create({
          connection,
          storedQueryData: {
            name,
            database,
            query: 'select distinct ?type {?s a ?type}',
          },
        })
        .then((res) => {
          expect(res.status).toBe(204);
          return stored.deleteStoredQuery({ connection, storedQuery: name });
        })
        .then((res) => {
          expect(res.status).toBe(204);
        });
    });
  });
});
