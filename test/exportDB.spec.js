/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('exportDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({ database });
  });

  it('should return a response with content-disposition header and the attachment export file', () =>
    db.exportData(conn, database).then(res => {
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(33);
    }));

  it('should return a response with content-disposition header and the attachment export file when using graph-uri param', () =>
    db
      .exportData(conn, database, undefined, {
        graphUri: 'tag:stardog:api:context:default',
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(33);
      }));
});
