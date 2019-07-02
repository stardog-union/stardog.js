import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';
import { RequestHeader, ContentType } from '../lib/constants';

const { reasoning, transaction } = db;

describe('reasoning commands', () => {
  const database = generateDatabaseName();
  const connection = ConnectionFactory();

  const beginTx: () => Promise<any> = transaction.begin.bind(null, {
    connection,
    database,
  });

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('should be able to check consistency', () =>
    reasoning
      .consistency({ connection, database })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body).toEqual(true)));

  it('should explain inferences', () =>
    reasoning
      .explainInference({
        connection,
        database,
        inference: '<urn:A> a <urn:B> .',
        requestHeaders: {
          [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
        },
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body.proofs).toBeTruthy()));

  it('should explain inconsistency', () =>
    reasoning
      .explainInconsistency({ connection, database })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body.proofs).toBeTruthy()));

  it('should successfully get the schema', () =>
    reasoning
      .schema({ connection, database })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((body) => expect(body).not.toEqual('')));
});
