const Stardog = require('../lib');
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
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should get NOT_FOUND status code trying to optimize a non-existent DB.', done => {
    conn.optimizeDB({ database: 'nodeDB_optimize' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it('should optimize an online DB', done => {
    conn.optimizeDB({ database }, (data, response4) => {
      expect(data.message).toEqual(`${database} was successfully optimized.`);
      expect(response4.statusCode).toEqual(200);
      done();
    });
  });
});
