/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('listDBInfo()', () => {
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

  it('should list info for available databases', () =>
    db.listInfo(conn).then(res => {
      expect(res.body.databases).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ 'database.name': one }),
          expect.objectContaining({ 'database.name': two }),
        ])
      );
    }));
});
