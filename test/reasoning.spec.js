/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

const { reasoning, transaction } = db;

describe('reasoning commands', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();

  const beginTx = transaction.begin.bind(null, conn, database);

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('should be able to check consistency', () =>
    reasoning.consistency(conn, database, {}).then(res => {
      expect(res.status).toBe(200);
      // expect(res.body).toEqual(true);  Commented out until server is fixed
      expect(res.body).toEqual('true');
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
    reasoning.explainInconsistency(conn, database, {}).then(res => {
      expect(res.status).toBe(200);
      expect(res.body.proofs).toBeTruthy();
    }));

  it.skip('should explain inferences in a tx', () =>
    beginTx()
      .then(res => {
        console.info(res);
        expect(res.status).toBe(200);
        return reasoning.explainInferenceInTx(
          conn,
          database,
          res.transactionId,
          '<urn:A> a <urn:B> .',
          { contentType: 'text/turtle' }
        );
      })
      .then(res => {
        console.info(res);
        expect(res.status).toBe(200);
        expect(res.body.proofs).toBeTruthy();
      })
  );

  it.skip('should explain inconsistency in a tx', () =>
    beginTx()
      .then(res => {
        expect(res.status).toBe(200);
        return reasoning.explainInconsistencyInTx(
          conn,
          database,
          res.transactionId,
          {}
        );
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.proofs).toBeTruthy();
      })
  );

  it('should successfully get the schema', () =>
    reasoning.schema(conn, database).then(res => {
      expect(res.status).toBe(200);
      expect(res.body).not.toEqual('');
    }));
});
