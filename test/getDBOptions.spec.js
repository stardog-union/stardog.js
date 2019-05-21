/* eslint-env jest */

const { db: { options } } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('db.getOptions()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should get NOT_FOUND status code trying to get the options of a non-existent DB.', () =>
    options.get(conn, 'nodeDB_test').then(res => {
      expect(res.status).toEqual(404);
    }));

  it('should get the options of a DB', () =>
    options.get(conn, database).then(res => {
      expect(res.status).toEqual(200);
      expect(res.body).toMatchObject({
        index: {
          type: 'Disk',
        },
      });
    }));

  it('should get all the options of a DB', () =>
    options.get(conn, database).then(res => {
      expect(res.status).toEqual(200);
      expect(typeof res.body).toEqual('object');
    }));

  it('should get all db config properties', () =>
    options.get(conn, database).then(res => {
      expect(res.status).toEqual(200);
      expect(typeof res.body).toEqual('object');
    }));
});
