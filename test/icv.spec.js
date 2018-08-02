/* eslint-env jest */

const fs = require('fs');
const path = require('path');
const { db: { icv, transaction, list } } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

const icvAxioms = fs.readFileSync(
  path.resolve(`${__dirname}/fixtures/issues/constraints.ttl`),
  'utf8'
);

describe('icv', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();

  beforeAll(
    seedDatabase(database, {
      icv: { enabled: true },
      transaction: { isolation: 'SERIALIZABLE' },
    })
  );
  afterAll(dropDatabase(database));

  it('should add integrity constraint axioms', () =>
    icv
      .add(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => {
        expect(res.status).toBe(204);
        return icv.get(conn, database);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
      }));

  // Skipping for now, as the server isn't returning the correct results
  it.skip('should remove integrity constraint axioms', () =>
    icv
      .add(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(() =>
        icv.remove(conn, database, icvAxioms, { contentType: 'text/turtle' })
      )
      .then(res => {
        expect(res.status).toBe(204);
        return icv.get(conn, database);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
      }));

  it('should clear integrity constraint axioms', () =>
    icv
      .add(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(() => icv.clear(conn, database))
      .then(res => {
        expect(res.status).toBe(204);
        return icv.get(conn, database);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
      }));

  it('should convert constraint axioms to a SPARQL query', () =>
    icv
      .convert(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => {
        expect(res.body.startsWith('SELECT')).toBe(true);
      }));

  it('should validate constraints', () =>
    icv
      .validate(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toBe(false);
      }));

  it('should validate constraints in a transaction', () =>
    transaction
      .begin(conn, database)
      .then(res => {
        expect(res.status).toBe(200);
        return icv.validateInTx(conn, database, res.transactionId, icvAxioms, {
          contentType: 'text/turtle',
        });
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toBe(false);
      }));

  it('should report violations', () =>
    icv.violations(conn, database, '').then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toBeNull();
    }));

  it('should report violations in a transaction', () =>
    list(conn)
      .then(console.log)
      .then(() => transaction.begin(conn, database))
      .then(res => {
        expect(res.status).toBe(200);
        return icv.violationsInTx(conn, database, res.transactionId, '');
      })
      .then(res => {
        console.log(JSON.stringify(res, null, 2));
        expect(res.status).toBe(200);
        expect(res.body).toBeNull();
      }));
});
