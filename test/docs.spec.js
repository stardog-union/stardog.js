/* eslint-env jest */

const { docs } = require('../lib/db');
const {
  generateDatabaseName,
  seedDatabase,
  dropDatabase,
  ConnectionFactory,
  getResource,
} = require('./setup-database');

describe('doc store', () => {
  const database = generateDatabaseName();
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  describe('size', () => {
    it('retrieves the size of the doc store', () =>
      docs.size(conn, database).then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toBe('0');
      }));
  });

  describe('add', () => {
    it('adds a document to the store', () =>
      docs
        .add(
          conn,
          database,
          getResource('fixtures/ng_tests.trig'),
          'ng_tests.trig'
        )
        .then(res => {
          expect(res.status).toBe(201);
        }));
  });

  describe('clear', () => {
    it('clears the document store', () =>
      docs.clear(conn, database).then(res => {
        expect(res.status).toBe(204);
      }));
  });

  describe('remove', () => {
    it('removes a document from the store', () =>
      docs
        .add(
          conn,
          database,
          getResource('fixtures/ng_tests.trig'),
          'ng_tests.trig'
        )
        .then(res => {
          expect(res.status).toBe(201);
          return docs.remove(conn, database, 'ng_tests.trig');
        })
        .then(res => {
          expect(res.status).toBe(204);
        }));
  });

  describe('get', () => {
    it('retrieves a document from the store', () =>
      docs
        .add(
          conn,
          database,
          getResource('fixtures/ng_tests.trig'),
          'ng_tests.trig'
        )
        .then(res => {
          expect(res.status).toBe(201);
          return docs.get(conn, database, 'ng_tests.trig');
        })
        .then(res => {
          expect(res.status).toBe(200);
          expect(res.body.length).toBeGreaterThan(0);
        }));
  });
});
