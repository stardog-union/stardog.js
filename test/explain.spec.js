const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('queryExplain()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('A response with the query plan should not be empty', done => {
    conn.onlineDB({ database }, () => {
      // TODO: might not be needed
      // put online if it"s not

      conn.queryExplain(
        {
          database,
          query: 'select ?s where { ?s ?p ?o } limit 10',
        },
        data => {
          expect(data).toEqual(expect.any(String));
          expect(data).toContain('Slice(offset=0, limit=10)');
          expect(data).toContain('Projection(?s)');
          expect(data).toContain('Scan');
          done();
        }
      );
    });
  });
});
