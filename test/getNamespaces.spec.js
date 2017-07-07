const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');
describe('getNamespaces()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({ database });
  });

  it('should retrieve the namespace prefix bindings for the database', () => {
    return db.namespaces(conn, conn.database).then(res => {
      expect(res.status).toEqual(200);
      expect(res.result).toEqual({
        '': 'http://example.org/vehicles/',
        owl: 'http://www.w3.org/2002/07/owl#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        stardog: 'tag:stardog:api:',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        ex: 'http://example.org/vehicles/',
      });
    });
  });
});
