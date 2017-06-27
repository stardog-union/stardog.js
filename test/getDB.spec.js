const Stardog = require('../lib');
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
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('A response of the DB info should not be empty', done => {
    conn.getDB({ database }, (data, response) => {
      expect(data.length).toBeGreaterThan(0);
      expect(response.statusCode).toEqual(200);
      done();
    });
  });
});
