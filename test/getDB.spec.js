const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('getDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('A response of the DB info should not be empty', () => {
    return db.get(conn, database).then(res => {
      expect(res.result).toMatch('@prefix : <http://example.org/vehicles/> .');
      expect(res.status).toEqual(200);
    });
  });
});
