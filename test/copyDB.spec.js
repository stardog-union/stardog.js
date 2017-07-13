/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('db.copy()', () => {
  const sourceDatabase = generateDatabaseName();
  const destinationDatabase = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(sourceDatabase));
  afterAll(dropDatabase(sourceDatabase));
  afterAll(dropDatabase(destinationDatabase));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should not copy an online DB', () =>
    db
      .copy(conn, sourceDatabase, destinationDatabase)
      .then(() => db.list(conn))
      .then(res => {
        expect(res.status).toEqual(200);
        // Destination shouldn't be listed because it's not online yet and therefor didn't get copied.
        expect(res.body.databases).not.toContain(destinationDatabase);
        expect(res.body.databases).toContain(sourceDatabase);
      }));

  it('should copy an offline DB', () =>
    db
      .offline(conn, sourceDatabase)
      .then(() => db.copy(conn, sourceDatabase, destinationDatabase))
      .then(() => db.list(conn))
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.body.databases).toContain(destinationDatabase);
        expect(res.body.databases).toContain(sourceDatabase);
      }));
});
