const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('getProperty()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('Gets a specific property from the database', done => {
    conn.getProperty(
      {
        database,
        uri: '<http://localhost/publications/articles/Journal1/1940/Article1>',
        property: '<http://localhost/vocabulary/bench/cdrom>',
      },
      response => {
        expect(response).toEqual(
          'http://www.hogfishes.tld/richer/succories.html'
        );
        done();
      }
    );
  });
});
