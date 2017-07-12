/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('getDBSize()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('A response with the size of the DB should not be empty', () => {
    db.size(conn, database).then(res => {
      const sizeNum = parseInt(res.result, 10);
      expect(sizeNum).toBe(48);
    });
  });
});
