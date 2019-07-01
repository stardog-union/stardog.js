import { query } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';
import { RequestHeader, ContentType } from '../lib/constants';

describe('queryExplain()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('A response with the query plan should not be empty', () =>
    query
      .explain({
        connection,
        database,
        query: 'select ?s where { ?s ?p ?o } limit 10',
      })
      .then((res) => res.text())
      .then((text) => {
        expect(text).toContain('Slice(offset=0, limit=10)');
        expect(text).toContain('Projection(?s)');
        expect(text).toContain('Scan');
      }));
});

describe('json queryExplain()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('A response with the query plan should not be empty', () =>
    query
      .explain({
        connection,
        database,
        query: 'select ?s where { ?s ?p ?o } limit 10',
        requestHeaders: {
          [RequestHeader.ACCEPT]: ContentType.JSON,
        },
      })
      .then((res) => res.json())
      .then((body) => {
        expect(body.plan.label).toBe('Slice(offset=0, limit=10)');
        expect(body.plan.children[0].label).toBe('Projection(?s)');
        expect(body.plan.children[0].children[0].label).toContain('Scan');
      }));
});
