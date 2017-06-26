const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('Group_Concat()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should execute a query with without errors, receiving 200 status code: Q1', done => {
    const queryStr =
      'select ?s (Group_Concat(?o ; separator=",") as ?o_s) where { ?s <#name> ?o } group by ?s';

    conn.query(
      {
        database,
        query: queryStr,
      },
      (data, response) => {
        expect(response.statusCode).toEqual(200);
        expect(data.results.bindings).toHaveLength(1);
        done();
      }
    );
  });
});
