/* eslint-env jest */

const path = require('path');
const fs = require('fs');
const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('namespaces.add()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should import namespaces from string contents', () =>
    db.namespaces
      .add(conn, database, '@prefix newNamespace: <http://newNamespace.com> .')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          numImportedNamespaces: 1,
          namespaces: expect.arrayContaining([
            '=http://example.org/issues#',
            'owl=http://www.w3.org/2002/07/owl#',
            'foaf=http://xmlns.com/foaf/0.1/',
            'paths=urn:paths:',
            'rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            'rdfs=http://www.w3.org/2000/01/rdf-schema#',
            'stardog=tag:stardog:api:',
            'xsd=http://www.w3.org/2001/XMLSchema#',
            'ex=http://example.org/vehicles/',
            'newNamespace=http://newNamespace.com',
          ]),
        });
      }));

  it('should import namespaces from a file', () =>
    db.namespaces
      .add(
        conn,
        database,
        fs.createReadStream(
          path.join(__dirname, 'fixtures', 'namespace_import.ttl')
        )
      )
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          numImportedNamespaces: 2,
          namespaces: expect.arrayContaining([
            '=http://example.org/issues#',
            'owl=http://www.w3.org/2002/07/owl#',
            'foaf=http://xmlns.com/foaf/0.1/',
            'paths=urn:paths:',
            'rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            'rdfs=http://www.w3.org/2000/01/rdf-schema#',
            'stardog=tag:stardog:api:',
            'xsd=http://www.w3.org/2001/XMLSchema#',
            'ex=http://example.org/vehicles/',
            'newNamespace=http://newNamespace.com',
            'newNamespace2=http://newNamespace2.com',
            'newNamespace3=http://newNamespace3.com',
          ]),
        });
      }));
});
