/* eslint-env jest */

const { db } = require('../lib');
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
    db.getOptions(conn, 'nodeDB_test').then(res => {
      expect(res.status).toEqual(404);
    }));

  it('should get the options of an DB', () =>
    db.getOptions(conn, database).then(res => {
      expect(res.status).toEqual(200);
      expect(res.result).toMatchObject({
        search: {
          enabled: true,
        },
        index: {
          type: 'Disk',
        },
      });
    }));
});
