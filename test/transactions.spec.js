/* eslint-env jest */

const fs = require('fs');
const { transaction, query, db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('transactions', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();

  const begin = transaction.begin.bind(null, conn, database);
  const commit = transaction.commit.bind(null, conn, database);
  const add = transaction.add.bind(null, conn, database);

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  expect.extend({
    toBeGUID(received) {
      const pass =
        received.match(
          // Lifed from https://stackoverflow.com/a/13653180/1011616
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        ) != null;
      if (pass) {
        return {
          pass,
          message: () => `expected ${received} to not be a GUID`,
        };
      }
      return {
        pass,
        message: () => `expected ${received} to be a GUID`,
      };
    },
  });

  it('Should be able to get a transaction and make a query', () =>
    begin()
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.result).toBe(res.transactionId);
        expect(res.result).toBeGUID();
        return transaction.query(
          conn,
          database,
          res.result,
          'select distinct ?s where { ?s ?p ?o }',
          { limit: 10 }
        );
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result.results.bindings).toHaveLength(10);
      }));

  it('Should be able to get a transaction, add a triple and rollback', () => {
    const triple =
      '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
      '<http://purl.org/dc/elements/1.1/subject> ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    return begin()
      .then(res => {
        const txId = res.transactionId;
        expect(res.status).toBe(200);
        expect(txId).toBeGUID();
        return add(txId, triple, {
          contentType: 'text/turtle',
        });
      })
      .then(res => {
        expect(res.status).toBe(200);
        return transaction.rollback(conn, database, res.transactionId);
      })
      .then(res => {
        expect(res.status).toBe(200);
      });
  });

  it('Should be able to get a transaction, add a triple with a defined prefix, commit that and query.', () => {
    const triple =
      '@prefix foo: <http://localhost/publications/articles/Journal1/1940/> .\n' +
      '@prefix dc: <http://purl.org/dc/elements/1.1/> .\n' +
      'foo:Article2 ' +
      'dc:subject ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    return begin()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result).toBeGUID();
        return add(res.transactionId, triple, {
          contentType: 'text/turtle',
        });
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.transactionId).toBeGUID();
        return commit(res.transactionId);
      })
      .then(res => {
        expect(res.status).toBe(200);
        const q = `
          prefix foo: <http://localhost/publications/articles/Journal1/1940/>
          prefix dc: <http://purl.org/dc/elements/1.1/>
          ask where {
          foo:Article2
          dc:subject
          "A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .}`;
        return query.execute(conn, database, q);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result).toBe(true);
        return begin();
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.transactionId).toBeGUID();
        return transaction.remove(conn, database, res.transactionId, triple, {
          contentType: 'text/turtle',
        });
      })
      .then(res => {
        expect(res.status).toBe(200);
        return commit(res.transactionId);
      })
      .then(res => {
        expect(res.status).toBe(200);
      });
  });

  it('Should be able to get a transaction, add a triple, commit that and query.', () => {
    const triple =
      '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
      '<http://purl.org/dc/elements/1.1/subject> ' +
      '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .';

    return begin()
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.result).toBeGUID();
        return add(res.transactionId, triple, {
          contentType: 'text/turtle',
        });
      })
      .then(res => {
        expect(res.status).toBe(200);
        return commit(res.transactionId);
      })
      .then(res => {
        expect(res.status).toBe(200);
        const q =
          'ask where { ' +
          '<http://localhost/publications/articles/Journal1/1940/Article2> ' +
          '<http://purl.org/dc/elements/1.1/subject> ' +
          '"A very interesting subject"^^<http://www.w3.org/2001/XMLSchema#string> .}';
        return query.execute(conn, database, q);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result).toBe(true);
        return begin();
      })
      .then(({ transactionId }) =>
        transaction.remove(conn, database, transactionId, triple, {
          contentType: 'text/turtle',
        })
      )
      .then(res => {
        expect(res.status).toBe(200);
        return commit(res.transactionId);
      })
      .then(res => {
        expect(res.status).toBe(200);
      });
  });

  it('Should be able to clean and insert all data in the DB using a transaction.', () => {
    const dbContent = fs.readFileSync(
      `${process.cwd()}/test/fixtures/api_tests.nt`,
      'utf-8'
    );
    return begin()
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result).toBeGUID();
        return db.clear(conn, database, res.transactionId);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.transactionId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
        return commit(res.transactionId);
      })
      .then(res => {
        expect(res.status).toBe(200);
        return db.size(conn, database);
      })
      .then(res => {
        expect(res.status).toBe(200);
        const sizeNum = parseInt(res.result, 10);
        expect(sizeNum).toBe(0);
        return begin();
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result).toBe(res.transactionId);
        expect(res.result).toBeGUID();
        return add(res.result, dbContent, {
          contentType: 'text/turtle',
        });
      })
      .then(res => {
        expect(res.status).toBe(200);
        return commit(res.transactionId);
      })
      .then(() => db.size(conn, database))
      .then(res => {
        expect(res.status).toBe(200);
        const sizeNum = parseInt(res.result, 10);
        expect(sizeNum).toBe(42);
      });
  });
});
