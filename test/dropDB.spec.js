/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('dropDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({ database });
  });

  it('should not drop an non-existent DB', () =>
    db.drop(conn, 'xxxx').then(res => {
      expect(res.status).toBe(404);
    }));

  it('should drop a DB', () =>
    db.drop(conn, database).then(res => {
      expect(res.status).toBe(200);
    }));
});
