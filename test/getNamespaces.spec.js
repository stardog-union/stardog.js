/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('getNamespaces()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should retrieve the namespace prefix bindings for the database', () =>
    db.namespaces(conn, database).then(res => {
      expect(res.status).toEqual(200);
      expect(res.body).toEqual({
        '': 'http://example.org/issues#',
        owl: 'http://www.w3.org/2002/07/owl#',
        foaf: 'http://xmlns.com/foaf/0.1/',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        stardog: 'tag:stardog:api:',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        ex: 'http://example.org/vehicles/',
      });
    }));
});
