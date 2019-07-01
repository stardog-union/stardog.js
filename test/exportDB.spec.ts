import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('exportDB()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return a response with content-disposition header and the attachment export file', () =>
    db
      .exportData({ connection, database })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body).toHaveLength(33)));

  it('should return a response with content-disposition header and the attachment export file when using graph-uri param', () =>
    db
      .exportData({
        connection,
        database,
        graphUri: 'tag:stardog:api:context:default',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body).toHaveLength(33)));
});
