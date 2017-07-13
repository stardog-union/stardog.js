/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('getDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('A response of the DB info should not be empty', () =>
    db.get(conn, database).then(res => {
      expect(res.result.length).toBe(7482);
      expect(
        res.result.includes(
          'overbites terminals giros podgy vagus kinkiest xix recollected'
        )
      ).toBe(true);
      expect(res.status).toEqual(200);
    }));
});
