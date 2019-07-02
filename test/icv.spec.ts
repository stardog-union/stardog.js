import fs from 'fs';
import path from 'path';
import { icv, transaction } from '../lib/db';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';
import { RequestHeader, ContentType } from '../lib/constants';

const turtleRequestHeaders = {
  [RequestHeader.CONTENT_TYPE]: ContentType.TEXT_TURTLE,
};

const icvAxioms = fs.readFileSync(
  path.resolve(`${__dirname}/fixtures/issues/constraints.ttl`),
  'utf8'
);

describe('icv', () => {
  const database = generateDatabaseName();
  const connection = ConnectionFactory();

  const beginTx = transaction.begin.bind(null, { connection, database });

  beforeAll(seedDatabase(database, { icv: { enabled: true } }));
  afterAll(dropDatabase(database));

  it('should add integrity constraint axioms', () =>
    icv
      .add({
        connection,
        database,
        icvAxioms,
        requestHeaders: turtleRequestHeaders,
      })
      .then((res) => {
        expect(res.status).toBe(204);
        return icv.get({ connection, database });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body.length).toBeGreaterThan(0)));

  // Skipping for now, as the server isn't returning the correct results
  it.skip('should remove integrity constraint axioms', () =>
    icv
      .add({
        connection,
        database,
        icvAxioms,
        requestHeaders: turtleRequestHeaders,
      })
      .then(() =>
        icv.remove({
          connection,
          database,
          icvAxioms,
          requestHeaders: turtleRequestHeaders,
        })
      )
      .then((res) => {
        expect(res.status).toBe(204);
        return icv.get({ connection, database });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body.length).toBe(0)));

  it('should clear integrity constraint axioms', () =>
    icv
      .add({
        connection,
        database,
        icvAxioms,
        requestHeaders: turtleRequestHeaders,
      })
      .then(() => icv.clear({ connection, database }))
      .then((res) => {
        expect(res.status).toBe(204);
        return icv.get({ connection, database });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body.length).toBe(0)));

  it('should convert constraint axioms to a SPARQL query', () =>
    icv
      .convert({
        connection,
        database,
        icvAxioms,
        requestHeaders: turtleRequestHeaders,
      })
      .then((res) => res.text())
      .then((text) => expect(text.startsWith('SELECT')).toBe(true)));

  it('should validate constraints', () =>
    icv
      .validate({
        connection,
        database,
        icvAxioms,
        requestHeaders: turtleRequestHeaders,
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => expect(text).toBe('false')));

  it('should validate constraints in a transaction', () =>
    beginTx()
      .then((res) => {
        expect(res.status).toBe(200);
        return icv.validateInTx({
          connection,
          database,
          transactionId: res.transactionId,
          icvAxioms,
          requestHeaders: turtleRequestHeaders,
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => expect(text).toBe('false')));

  it('should report violations', () =>
    icv
      .violations({ connection, database, icvAxioms: '' })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => expect(text).toBe('')));

  it('should report violations in a transaction', () =>
    beginTx()
      .then((res) => {
        expect(res.status).toBe(200);
        return icv.violationsInTx({
          connection,
          database,
          transactionId: res.transactionId,
          icvAxioms: '',
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => expect(text).toBe('')));

  it('should produce violation reports', () =>
    icv
      .report({ connection, database, icvAxioms: '' })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => {
        expect(body.length).not.toBe(0);
        expect(body[0]).toHaveProperty('@id');
        expect(body[0]).toHaveProperty('@type');
        // Can't use `toHaveProperty` below because jest thinks it's a path for nested properties
        expect(body[0]['http://www.w3.org/ns/shacl#conforms']).toBeDefined();
      }));

  it('should produce violation reports in a transaction', () =>
    beginTx()
      .then((res) => {
        expect(res.status).toBe(200);
        return icv.reportInTx({
          connection,
          database,
          transactionId: res.transactionId,
          icvAxioms: '',
        });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => {
        expect(body.length).not.toBe(0);
        expect(body[0]).toHaveProperty('@id');
        expect(body[0]).toHaveProperty('@type');
        // Can't use `toHaveProperty` below because jest thinks it's a path for nested properties
        expect(body[0]['http://www.w3.org/ns/shacl#conforms']).toBeDefined();
      }));
});
