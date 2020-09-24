/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('optimizeDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should get NOT_FOUND status code trying to optimize a non-existent DB.', () =>
    db.optimize(conn, 'nodeDB_optimize').then(res => {
      expect(res.status).toEqual(404);
    }));

  // TODO: This case is currently skipped because there is no way in Stardog
  // 7.3.x to ensure that the DB is ready for optimization (so, this often
  // errors out). The erroring out should be fixed in Stardog 7.4.1.
  it.skip('should optimize an online DB', () =>
    db.optimize(conn, database).then(res => {
      expect(res.status).toEqual(200);
    }));
});
