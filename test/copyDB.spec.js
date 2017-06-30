const { Connection, db } = require('../lib/index2');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
} = require('./setup-database');

describe('db.copy()', () => {
  const sourceDatabase = generateDatabaseName();
  const destinationDatabase = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(sourceDatabase));
  afterAll(dropDatabase(sourceDatabase));
  afterAll(dropDatabase(destinationDatabase));

  beforeEach(() => {
    conn = new Connection({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820/',
    });
  });

  it('should not copy an online DB', () => {
    return db
      .copy(conn, sourceDatabase, destinationDatabase)
      .then(() => db.list(conn))
      .then(res => {
        expect(res.status).toEqual(200);
        // Destination shouldn't be listed because it's not online yet and therefor didn't get copied.
        expect(res.result.databases).not.toContain(destinationDatabase);
        expect(res.result.databases).toContain(sourceDatabase);
      });
  });

  it('should copy an offline DB', () => {
    return db
      .offline(conn, sourceDatabase)
      .then(() => db.copy(conn, sourceDatabase, destinationDatabase))
      .then(() => db.list(conn))
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.result.databases).toContain(destinationDatabase);
        expect(res.result.databases).toContain(sourceDatabase);
      });
  });
});
