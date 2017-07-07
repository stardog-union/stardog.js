const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('exportDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({ database });
  });

  it('should return a response with content-disposition header and the attachment export file', () => {
    return db.export(conn, conn.database).then(res => {
      expect(res.status).toBe(200);
      expect(res.result).toHaveLength(12);
    });
  });

  it('should return a response with content-disposition header and the attachment export file when using graph-uri param', () => {
    const options = {
      database,
      graphUri: 'tag:stardog:api:context:default',
    };

    return db
      .export(conn, conn.database, undefined, {
        graphUri: 'tag:stardog:api:context:default',
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result).toHaveLength(12);
      });
  });
});
