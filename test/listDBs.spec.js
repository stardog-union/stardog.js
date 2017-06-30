const { Connection, db } = require('../lib/index2');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('listDBs()', () => {
  const one = generateDatabaseName();
  const two = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(one));
  beforeAll(seedDatabase(two));
  afterAll(dropDatabase(one));
  afterAll(dropDatabase(two));

  beforeEach(() => {
    conn = new Connection({
      endpoint: 'http://localhost:5820/',
      username: 'admin',
      password: 'admin',
    });
  });

  it('should list available databases', () => {
    db.list(conn).then(res => {
      expect(res.result.databases).toEqual(expect.arrayContaining([one, two]));
    });
  });
});
