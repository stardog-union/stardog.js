import path from 'path';
import fs from 'fs';
import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('namespaces.add()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should import namespaces from string contents', () =>
    db.namespaces
      .add({
        connection,
        database,
        fileOrContents: '@prefix newNamespace: <http://newNamespace.com> .',
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((json) =>
        expect(json).toEqual({
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
        })
      ));

  it('should import namespaces from a file', () =>
    db.namespaces
      .add({
        connection,
        database,
        fileOrContents: fs.createReadStream(
          path.join(__dirname, 'fixtures', 'namespace_import.ttl')
        ),
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((json) =>
        expect(json).toEqual({
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
        })
      ));
});
