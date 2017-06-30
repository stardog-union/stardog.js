const { Connection, db } = require('../lib/index2');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('getDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Connection({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820',
    });
  });

  it('A response of the DB info should not be empty', () => {
    return db.get(conn, database).then(res => {
      expect(res.result).toMatch('@prefix : <http://example.org/vehicles/> .');
      expect(res.status).toEqual(200);
    });
  });
});
