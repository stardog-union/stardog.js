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

const convertToJsonLd = (conn, storedQuery) => {
  const types = ['system:StoredQuery'];
  if (storedQuery.shared) {
    types.push('system:SharedQuery');
  }
  if (storedQuery.reasoning) {
    types.push('system:ReasoningQuery');
  }

  const keyValuePairs = Object.entries(
    Object.assign(
      {
        'system:queryName': storedQuery.name,
        'system:queryDescription': storedQuery.description,
        'system:queryString': storedQuery.query,
        'system:queryCreator': conn.username,
        'system:queryDatabase': storedQuery.database,
      },
      storedQuery.annotations
    )
  ).reduce((obj, [iri, value]) => {
    if (typeof value !== 'undefined') {
      obj[iri] = { '@value': value };
    }
    return obj;
  }, {});

  return {
    '@context': {
      system: 'http://system.stardog.com/',
    },
    '@graph': [
      Object.assign(
        {
          '@id': 'system:Query',
          '@type': types,
        },
        keyValuePairs
      ),
    ],
  };
};

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
    it('creates and updates a new stored query with annotations (using jsonld)', () => {
      const name = generateRandomString();
      const query = 'select distinct ?type { ?s a ?type }';
      const newQuery = 'select * { ?a ?b ?c }';

      return stored
        .create(
          conn,
          convertToJsonLd(conn, {
            name,
            database,
            query,
            annotations: { 'iri:annotation:thing': 'is a string!' },
          }),
          { contentType: 'application/ld+json' }
        )
        .then(res => {
          expect(res.status).toBe(204);
          return stored.list(conn, { accept: 'application/ld+json' });
        })
        .then(res => {
          expect(res.status).toBe(200);
          const storedQuery = res.body['@graph'].find(
            v => v['system:queryName']['@value'] === name
          );
          expect(storedQuery).toBeTruthy();
          expect(storedQuery['iri:annotation:thing']['@value']).toBe(
            'is a string!'
          );
          expect(storedQuery['system:queryString']['@value']).toBe(query);

          return stored.update(
            conn,
            convertToJsonLd(conn, {
              name,
              database,
              query: newQuery,
              annotations: { 'iri:annotation:thing': 'is a new string!' },
            }),
            true,
            { contentType: 'application/ld+json' }
          );
        })
        .then(res => {
          expect(res.status).toBe(204);
          return stored.list(conn, { accept: 'application/ld+json' });
        })
        .then(res => {
          expect(res.status).toBe(200);
          const storedQuery = res.body['@graph'].find(
            v => v['system:queryName']['@value'] === name
          );
          expect(storedQuery).toBeTruthy();
          expect(storedQuery['iri:annotation:thing']['@value']).toBe(
            'is a new string!'
          );
          expect(storedQuery['system:queryString']['@value']).toBe(newQuery);
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
  describe('remove()', () => {
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
  describe('rename()', () => {
    it('renames a stored query', () => {
      const name = generateRandomString();
      const newName = generateRandomString();
      return stored
        .create(conn, {
          name,
          database,
          query: 'select distinct ?type {?s a ?type}',
        })
        .then(res => {
          expect(res.status).toBe(204);
          return stored.rename(conn, name, newName);
        })
        .then(res => {
          expect(res.status).toBe(204);
        });
    });
  });
});
