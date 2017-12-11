/* eslint-env jest */

const { query, db } = require('../lib');

const { transaction, versioning } = db;

const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('versioning', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database, { versioning: { enabled: true } }));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  const theTriple = '<urn:foo> <urn:bar> <urn:baz> .';
  const versPrefix = 'tag:stardog:api:versioning:';
  const aCommitMsg = 'Add some data';

  const addSomeData = () => {
    let tid;
    return transaction
      .begin(conn, database)
      .then(res => {
        tid = res.body;
        return db.add(conn, database, tid, theTriple, {
          contentType: 'text/turtle',
        });
      })
      .then(res => {
        expect(res.status).toBe(200);
        return versioning.commit(conn, database, tid, aCommitMsg);
      })
      .then(res => {
        expect(res.status).toBe(200);
        return transaction.commit(conn, database, tid);
      });
  };

  describe('query', () => {
    it('runs a query against the versioning metadata', () =>
      versioning.query(conn, database, 'select * {?s ?p ?o}').then(res => {
        expect(res.status).toBe(200);
        expect(JSON.stringify(res.body)).toContain('Database creation');
      }));

    it('can also enforce the content-type of the response', () =>
      versioning
        .query(
          conn,
          database,
          'select * {?s ?p ?o}',
          'application/sparql-results+xml'
        )
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toContain('Database creation');
          expect(res.headers.get('Content-Type')).toBe(
            'application/sparql-results+xml'
          );
        }));
  });

  describe('commit', () => {
    it('commits a tx into versioning', () =>
      addSomeData().then(res => {
        expect(res.status).toBe(200);
      }));
  });

  describe('createTag/deleteTag', () => {
    const aTagName = 'MyTag';
    it('can create and then delete a tag', () =>
      versioning
        .query(conn, database, `select * {?s a <${versPrefix}Version>} limit 1`)
        .then(res => {
          const revId = res.body.results.bindings[0].s.value.substring(
            `${versPrefix}version:`.length
          );
          return versioning.createTag(conn, database, revId, aTagName);
        })
        .then(res => {
          expect(res.status).toBe(201);
          return versioning.deleteTag(conn, database, aTagName);
        })
        .then(res => {
          expect(res.status).toBe(204);
        }));
  });

  describe('revert', () => {
    it('can commit data and then revert the db', () => {
      let commitRevId;
      return addSomeData()
        .then(res => {
          expect(res.status).toBe(200);
          return versioning.query(
            conn,
            database,
            `select ?s {?s a <${versPrefix}Version>; rdfs:comment "${aCommitMsg}"} limit 1`
          );
        })
        .then(res => {
          expect(res.status).toBe(200);
          commitRevId = res.body.results.bindings[0].s.value.substring(
            `${versPrefix}version:`.length
          );
          return query.execute(
            conn,
            database,
            `ask {${theTriple}}`,
            'text/boolean'
          );
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toBe(true);
          return versioning.query(
            conn,
            database,
            `select ?s {?s a <${versPrefix}Version>; rdfs:comment "Database creation"}`
          );
        })
        .then(res => {
          expect(res.status).toBe(200);
          const dbCreateRevId = res.body.results.bindings[0].s.value.substring(
            `${versPrefix}version:`.length
          );
          return versioning.revert(
            conn,
            database,
            commitRevId,
            dbCreateRevId,
            'Revert'
          );
        })
        .then(res => {
          expect(res.status).toBe(204);
          return query.execute(
            conn,
            database,
            `ask {${theTriple}}`,
            'text/boolean'
          );
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body).toBe(false);
        });
    });
  });
});
