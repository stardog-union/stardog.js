/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

const { reasoning, transaction } = db;

// NOTE: These are skipped right now due to a bug in Stardog 7.4.5+ (see
// PLAT-2027). In the meantime, they have been confirmed against Stardog 7.4.4.
describe.skip('reasoning commands', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();

  const beginTx = transaction.begin.bind(null, conn, database);
  const rollbackTx = transaction.rollback.bind(null, conn, database);

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('should be able to check consistency', () =>
    reasoning.consistency(conn, database).then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toEqual(true);
    }));

  it('should explain inferences', () =>
    reasoning
      .explainInference(conn, database, '<urn:A> a <urn:B> .', {
        contentType: 'text/turtle',
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.proofs).toBeTruthy();
      }));

  it('should explain inconsistency', () =>
    reasoning.explainInconsistency(conn, database).then(res => {
      expect(res.status).toBe(200);
      expect(res.body.proofs).toBeTruthy();
    }));

  // Skipped due to Stardog bug PLAT-1735
  it.skip('should explain inferences in a tx', () => {
    let transactionId;

    return beginTx()
      .then(res => {
        transactionId = res.transactionId;
        expect(res.status).toBe(200);
        return reasoning.explainInferenceInTransaction(
          conn,
          database,
          transactionId,
          '<urn:A> a <urn:B> .',
          { contentType: 'text/turtle' }
        );
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.proofs).toBeTruthy();
        return rollbackTx(transactionId);
      })
      .catch(err => {
        rollbackTx(transactionId);
        throw err;
      });
  });

  // Skipped due to Stardog bug PLAT-1735
  it.skip('should explain inconsistency in a tx', () => {
    let transactionId;

    return beginTx()
      .then(res => {
        transactionId = res.transactionId;
        expect(res.status).toBe(200);
        return reasoning.explainInconsistencyInTransaction(
          conn,
          database,
          transactionId,
          {}
        );
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.proofs).toBeTruthy();
        return rollbackTx(transactionId);
      })
      .catch(err => {
        rollbackTx(transactionId);
        throw err;
      });
  });

  it('should successfully get the schema', () =>
    reasoning.schema(conn, database).then(res => {
      expect(res.status).toBe(200);
      expect(res.body).not.toEqual('');
    }));
});
