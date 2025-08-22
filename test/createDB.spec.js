/* eslint-env jest */

const { db } = require('../lib');
const {
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

  it('should not be able to create a new db with the name of an existing DB', () =>
    db
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
        // Database already exists
        expect(res.headers.get('sd-error-code')).toBe('0D0DE2');
      }));
});
