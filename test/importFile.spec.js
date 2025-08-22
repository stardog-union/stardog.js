/* eslint-env jest */

const path = require('path');
const fs = require('fs');
const { query, virtualGraphs } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

const properties = `
base=http://example.com
csv.header=true
unique.key.sets=(Model)
`;

describe('virtualGraphs.importFile()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should import CSV files without mappings', () =>
    virtualGraphs
      .importFile(
        conn,
        fs.createReadStream(path.join(__dirname, 'fixtures', 'csv_import.csv')),
        `file://test-${Date.now()}`,
        'DELIMITED',
        database,
        {
          properties,
        }
      )
      .then(res => {
        expect(res.status).toBe(200);
        return query.execute(
          conn,
          database,
          'select ?o { <http://example.com/Model=E350> <http://example.com#Model> ?o }'
        );
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings[0].o.value).toBe('E350');
      }));

  it('should import CSV files with mappings', () =>
    virtualGraphs
      .importFile(
        conn,
        fs.createReadStream(path.join(__dirname, 'fixtures', 'csv_import.csv')),
        `file://test-${Date.now()}`,
        'DELIMITED',
        database,
        {
          mappings: fs.readFileSync(
            path.join(__dirname, 'fixtures', 'csv_import_mappings.sms')
          ),
          properties: 'mappings.syntax=sms2',
        }
      )
      .then(res => {
        expect(res.status).toBe(200);
        return query.execute(
          conn,
          database,
          'select ?o { <http://example.org/cars#Model-E350> <http://purl.org/goodrelations/v1#hasManufacturer> ?o }'
        );
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings[0].o.value).toBe(
          'http://example.org/cars#Manufacturer-Ford'
        );
      }));

  it('should import JSON files (mappings required)', () =>
    virtualGraphs
      .importFile(
        conn,
        fs.createReadStream(
          path.join(__dirname, 'fixtures', 'json_import.json')
        ),
        `file://test-${Date.now()}`,
        'JSON',
        database,
        {
          mappings: fs
            .readFileSync(
              path.join(__dirname, 'fixtures', 'json_import_mappings.sms')
            )
            .toString(),
          properties,
        }
      )
      .then(res => {
        expect(res.status).toBe(200);
        return query.execute(
          conn,
          database,
          'select ?o { ?s <http://example.com/hash> ?o }'
        );
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.results.bindings[0].o.value).toBe(
          '00000000000000000028484e3ba77273ebd245f944e574e1d4038d9247a7ff8e'
        );
      }));
});
