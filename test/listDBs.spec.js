/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
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
    conn = ConnectionFactory();
  });

  it('should list available databases', () => {
    db.list(conn).then(res => {
      expect(res.body.databases).toEqual(expect.arrayContaining([one, two]));
    });
  });
});
