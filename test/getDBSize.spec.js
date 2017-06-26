const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('getDBSize()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('A response with the size of the DB should not be empty', done => {
    conn.getDBSize({ database }, response => {
      const sizeNum = parseInt(response, 10);
      expect(sizeNum).toBe(48);
      done();
    });
  });
});
