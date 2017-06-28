const Stardog = require('../lib/index2');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('getDBOptions()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820/',
    });
  });

  it('should get NOT_FOUND status code trying to get the options of a non-existent DB.', () => {
    return conn.getDBOptions('nodeDB_test').then(res => {
      expect(res.status).toEqual(404);
    });
  });

  it('should get the options of an DB', () => {
    return conn.getDBOptions(database).then(res => {
      expect(res.status).toEqual(200);
      expect(res.result).toMatchObject({
        search: {
          enabled: true,
        },
        index: {
          type: 'Disk',
        },
      });
    });
  });
});
