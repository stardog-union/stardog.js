/* eslint-env jest */

const fs = require('fs');
const path = require('path');
const { db: { icv, transaction } } = require('../lib');
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

  const beginTx = transaction.begin.bind(null, conn, database);
  const rollbackTx = txId => transaction.rollback(conn, database, txId);

  beforeAll(
    seedDatabase(database, {
      icv: { enabled: true },
      transaction: { isolation: 'SERIALIZABLE' }, // needed for ICV in Stardog 7+
    })
  );
  afterAll(dropDatabase(database));

  // skipped as this is no longer supported in Stardog 8.0.0+
  it.skip('should add integrity constraint axioms', () =>
    icv
      .add(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => {
        expect(res.status).toBe(204);
        return icv.get(conn, database);
      })
      .then(res => {
        expect(res.status).toBe(200);
        return icv.clear(conn, database);
      }));

  // skipped as this is no longer supported in Stardog 8.0.0+
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
      }));

  // skipped as this is no longer supported in Stardog 8.0.0+
  it.skip('should clear integrity constraint axioms', () =>
    icv
      .add(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(() => icv.clear(conn, database))
      .then(res => {
        expect(res.status).toBe(204);
        return icv.get(conn, database);
      })
      .then(res => {
        expect(res.status).toBe(200);
      }));

  it('should validate constraints', () =>
    icv
      .validate(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toBe(true);
      }));

  it('should validate constraints in a transaction', () =>
    beginTx().then(res => {
      expect(res.status).toBe(200);
      return icv
        .validateInTx(conn, database, res.transactionId, icvAxioms, {
          contentType: 'text/turtle',
        })
        .then(validateRes => {
          expect(validateRes.status).toBe(200);
          expect(validateRes.body).toBe(true);
        })
        .then(() => rollbackTx(res.transactionId));
    }));

  // covered by Validate SPARQL queries in 9.0.0+, but not deprecated
  // but the test is currently broken (doesn't like accept type!)
  it.skip('should report violations', () =>
    icv.violations(conn, database, '').then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toBeNull();
    }));

  // covered by Validate SPARQL queries in 9.0.0+, but not deprecated
  // but the test is currently broken (doesn't like accept type!)
  it.skip('should report violations in a transaction', () =>
    beginTx().then(res => {
      expect(res.status).toBe(200);
      return icv
        .violationsInTx(conn, database, res.transactionId, '')
        .then(violationsRes => {
          expect(violationsRes.status).toBe(200);
          expect(violationsRes.body).toBeNull();
        })
        .then(() => rollbackTx(res.transactionId));
    }));

  it('should produce violation reports', () =>
    icv.report(conn, database, '').then(res => {
      expect(res.status).toBe(200);
      const reportData = res.body['@graph'];
      expect(reportData.length).not.toBe(0);
      expect(reportData[0]).toHaveProperty('@id');
      expect(reportData[0]).toHaveProperty('@type');
      // Can't use `toHaveProperty` below because jest thinks it's a path for nested properties
      expect(reportData[0]['sh:conforms']['@value']).toBe(true);
    }));

  it('should produce violation reports in a transaction', () =>
    beginTx().then(res => {
      expect(res.status).toBe(200);
      return icv
        .reportInTx(conn, database, res.transactionId, '')
        .then(reportRes => {
          expect(reportRes.status).toBe(200);
          const reportData = reportRes.body['@graph'];
          expect(reportData.length).not.toBe(0);
          expect(reportData[0]).toHaveProperty('@id');
          expect(reportData[0]).toHaveProperty('@type');
          // Can't use `toHaveProperty` below because jest thinks it's a path for nested properties
          expect(reportData[0]['sh:conforms']['@value']).toBe(true);
        })
        .then(() => rollbackTx(res.transactionId));
    }));
});
