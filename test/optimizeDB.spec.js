const { Connection, db } = require('../lib/index2');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('optimizeDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Connection({
      endpoint: 'http://localhost:5820/',
      username: 'admin',
      password: 'admin',
    });
  });

  it('should get NOT_FOUND status code trying to optimize a non-existent DB.', () => {
    return db.optimize(conn, 'nodeDB_optimize').then(res => {
      expect(res.status).toEqual(404);
    });
  });

  it('should optimize an online DB', () => {
    return db.optimize(conn, database).then(res => {
      expect(res.status).toEqual(200);
    });
  });
});
