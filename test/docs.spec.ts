import { docs } from '../lib/db';
import {
  generateDatabaseName,
  seedDatabase,
  dropDatabase,
  ConnectionFactory,
} from './setup-database';

describe('doc store', () => {
  const database = generateDatabaseName();
  const aFileName = 'myFile.txt';
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  describe('size', () => {
    it('retrieves the size of the doc store', () =>
      docs.size({ connection, database }).then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toBe('0');
      }));
  });

  describe('add', () => {
    it('adds a document to the store', () =>
      docs
        .add({
          connection,
          database,
          fileName: aFileName,
          fileContents: 'contents',
        })
        .then((res) => {
          expect(res.status).toBe(201);
        }));
  });

  describe('clear', () => {
    it('clears the document store', () =>
      docs.clear({ connection, database }).then((res) => {
        expect(res.status).toBe(204);
      }));
  });

  describe('remove', () => {
    it('removes a document from the store', () =>
      docs
        .add({
          connection,
          database,
          fileName: aFileName,
          fileContents: 'contents',
        })
        .then((res) => {
          expect(res.status).toBe(201);
          return docs.remove({ connection, database, fileName: aFileName });
        })
        .then((res) => {
          expect(res.status).toBe(204);
        }));
  });

  describe('get', () => {
    it('retrieves a document from the store', () =>
      docs
        .add({
          connection,
          database,
          fileName: aFileName,
          fileContents: 'contents',
        })
        .then((res) => {
          expect(res.status).toBe(201);
          return docs.get({ connection, database, fileName: aFileName });
        })
        .then((res) => {
          expect(res.status).toBe(200);
          return res;
        })
        .then((res) => res.json())
        .then((res) => expect(res.body.length).toBeGreaterThan(0)));
  });
});
