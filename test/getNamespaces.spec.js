const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');
describe('getNamespaces()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should throw an Error when the database option was not passed in the options object.', () => {
    expect(() => {
      conn.getNamespaces();
    }).toThrow(/Option `database` is required/);
  });

  it('should retrieve the namespace prefix bindings for the database', done => {
    conn.getNamespaces(
      {
        database,
      },
      (data, response) => {
        expect(response.statusCode).toEqual(200);
        expect(data).toEqual({
          '': 'http://example.org/vehicles/',
          owl: 'http://www.w3.org/2002/07/owl#',
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          stardog: 'tag:stardog:api:',
          xsd: 'http://www.w3.org/2001/XMLSchema#',
          ex: 'http://example.org/vehicles/',
        });
        done();
      }
    );
  });
});
