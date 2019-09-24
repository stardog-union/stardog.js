import * as semver from 'semver';
import { query, server, Connection } from '../lib';
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
      return Promise.all([
        server.status({ connection, params: { databases: false } }),
        stored.create({
          connection,
          storedQueryData: {
            name,
            database,
            query: 'select distinct ?type {?s a ?type}',
            shared: true,
          },
        }),
      ])
        .then(([statusRes, res]) => {
          expect(res.status).toBe(204);
          return Promise.all([statusRes, stored.list({ connection })]);
        })
        .then(([statusRes, res]) => {
          expect(res.status).toBe(200);
          return Promise.all([statusRes.json(), res.json()]);
        })
        .then(([statusResJson, resJson]) => {
          const stardogVersion = statusResJson['dbms.version'].value;
          const q = resJson.queries.find((v) => v.name === name);
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
