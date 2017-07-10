const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('createDB()', () => {
  const database = generateDatabaseName();
  let conn;

  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({ database });
  });

  it('should not be able to create a new db with the name of an existing DB', () => {
    const options = {
      database,
      options: { 'index.type': 'disk' },
      files: [],
    };

    return db
      .create(conn, database, {
        index: {
          type: 'disk',
        },
      })
      .then(res => {
        expect(res.status).toBe(201);
        return db.create(conn, database);
      })
      .then(res => {
        expect(res.status).toBe(409);
      });
  });
});
