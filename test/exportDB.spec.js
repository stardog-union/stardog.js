const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('exportDB()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should return a response with content-disposition header and the attachment export file', done => {
    var options = {
      database,
    };

    conn.exportDB(options, (data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(response.headers['content-disposition']).toEqual(
        'attachment; filename=export.jsonld'
      );

      done();
    });
  });

  it('should return a response with content-disposition header and the attachment export file when using graph-uri param', done => {
    var options = {
      database,
      graphUri: 'tag:stardog:api:context:default',
    };

    conn.exportDB(options, (data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(response.headers['content-disposition']).toEqual(
        'attachment; filename=export.jsonld'
      );

      done();
    });
  });
});
