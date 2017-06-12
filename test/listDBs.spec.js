const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('listDBs()', () => {
  const one = generateDatabaseName();
  const two = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(one));
  beforeAll(seedDatabase(two));
  afterAll(dropDatabase(one));
  afterAll(dropDatabase(two));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should list available databases', done => {
    conn.listDBs(data => {
      expect(data.databases).toEqual(expect.arrayContaining([one, two]));
      done();
    });
  });
});
