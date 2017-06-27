const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('exportDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should return a response with content-disposition header and the attachment export file', done => {
    const options = {
      database,
    };

    conn.exportDB(options, (data, response) => {
      expect(response.statusCode).toEqual(200);
      const res = JSON.parse(response.raw.toString());
      expect(res).toHaveLength(12);
      done();
    });
  });

  it('should return a response with content-disposition header and the attachment export file when using graph-uri param', done => {
    const options = {
      database,
      graphUri: 'tag:stardog:api:context:default',
    };

    conn.exportDB(options, (data, response) => {
      expect(response.statusCode).toEqual(200);
      const res = JSON.parse(response.raw.toString());
      expect(res).toHaveLength(12);
      done();
    });
  });
});
