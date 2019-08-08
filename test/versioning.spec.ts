import { query, db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';
import { RequestHeader, ContentType } from '../lib/constants';

const { transaction, versioning } = db;

// FIXME: Skipped for now due to versioning not working in Stardog 7+.
// Unskip these when Stardog 7+ supports versioning.
describe.skip('versioning', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database, { versioning: { enabled: true } }));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  const theTriple = '<urn:foo> <urn:bar> <urn:baz> .';
  const versPrefix = 'tag:stardog:api:versioning:';
  const aCommitMsg = 'Add some data';

  const addSomeData = () => {
    let tid;
    return transaction
      .begin({ connection, database })
      .then((res) => {
        tid = res.transactionId;
        return db.add({
          connection,
          database,
          transactionId: tid,
          content: theTriple,
          requestHeaders: {
            [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
          },
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return versioning.commit({
          connection,
          database,
          transactionId: tid,
          commitMsg: aCommitMsg,
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return transaction.commit({ connection, database, transactionId: tid });
      });
  };

  describe('query', () => {
    it('runs a query against the versioning metadata', () =>
      versioning
        .executeQuery({ connection, database, query: 'select * {?s ?p ?o}' })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) =>
          expect(JSON.stringify(body)).toContain('Database creation')
        ));

    it('can also enforce the content-type of the response', () =>
      versioning
        .executeQuery({
          connection,
          database,
          query: 'select * {?s ?p ?o}',
          requestHeaders: {
            [RequestHeader.ACCEPT]: 'application/sparql-results+xml',
          },
        })
        .then((res) => {
          expect(res.status).toBe(200);
          expect(res.headers.get('Content-Type')).toBe(
            'application/sparql-results+xml'
          );
          return res.text();
        })
        .then((text) => expect(text).toContain('Database creation')));
  });

  describe('commit', () => {
    it('commits a tx into versioning', () =>
      addSomeData().then((res) => {
        expect(res.status).toBe(200);
      }));
  });

  describe('createTag/deleteTag', () => {
    const aTagName = 'MyTag';
    it('can create and then delete a tag', () =>
      versioning
        .executeQuery({
          connection,
          database,
          query: `select * {?s a <${versPrefix}Version>} limit 1`,
        })
        .then((res) => res.json())
        .then((body) => {
          const revId = body.results.bindings[0].s.value.substring(
            `${versPrefix}version:`.length
          );
          return versioning.createTag({
            connection,
            database,
            revisionId: revId,
            tagName: aTagName,
          });
        })
        .then((res) => {
          expect(res.status).toBe(201);
          return versioning.deleteTag({
            connection,
            database,
            tagName: aTagName,
          });
        })
        .then((res) => {
          expect(res.status).toBe(204);
        }));
  });

  describe('revert', () => {
    it('can commit data and then revert the db', () => {
      let commitRevId;
      return addSomeData()
        .then((res) => {
          expect(res.status).toBe(200);
          return versioning.executeQuery({
            connection,
            database,
            query: `select ?s {?s a <${versPrefix}Version>; rdfs:comment "${aCommitMsg}"} limit 1`,
          });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          commitRevId = body.results.bindings[0].s.value.substring(
            `${versPrefix}version:`.length
          );
          return query.execute({
            connection,
            database,
            query: `ask {${theTriple}}`,
            requestHeaders: {
              [RequestHeader.ACCEPT]: ContentType.TEXT_BOOLEAN,
            },
          });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.text();
        })
        .then((text) => {
          expect(text).toBe('true');
          return versioning.executeQuery({
            connection,
            database,
            query: `select ?s {?s a <${versPrefix}Version>; rdfs:comment "Database creation"}`,
          });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.json();
        })
        .then((body) => {
          const dbCreateRevId = body.results.bindings[0].s.value.substring(
            `${versPrefix}version:`.length
          );
          return versioning.revert({
            connection,
            database,
            fromRevisionId: commitRevId,
            toRevisionId: dbCreateRevId,
            logMsg: 'Revert',
          });
        })
        .then((res) => {
          expect(res.status).toBe(204);
          return query.execute({
            connection,
            database,
            query: `ask {${theTriple}}`,
            requestHeaders: {
              [RequestHeader.ACCEPT]: ContentType.TEXT_BOOLEAN,
            },
          });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res.text();
        })
        .then((text) => expect(text).toBe('false'));
    });
  });
});
