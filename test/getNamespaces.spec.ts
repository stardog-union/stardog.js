import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('getNamespaces()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should retrieve the namespace prefix bindings for the database', () =>
    db
      .namespaces({ connection, database })
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((body) =>
        expect(body).toEqual({
          '': 'http://example.org/issues#',
          owl: 'http://www.w3.org/2002/07/owl#',
          foaf: 'http://xmlns.com/foaf/0.1/',
          paths: 'urn:paths:',
          rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
          rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
          stardog: 'tag:stardog:api:',
          xsd: 'http://www.w3.org/2001/XMLSchema#',
          ex: 'http://example.org/vehicles/',
        })
      ));
});
