const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
} = require('./setup-database');

describe('createDB()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should not be able to create a new db with the name of an existing DB', done => {
    const options = {
      database,
      options: { 'index.type': 'disk' },
      files: [],
    };

    conn.createDB(options, (data, response) => {
      expect(response.statusCode).toEqual(409);

      done();
    });
  });
});
