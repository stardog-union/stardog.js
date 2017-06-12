const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('queryGraph()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('A graph query for ALL result should not be empty', done => {
    conn.queryGraph(
      { database, query: 'construct where { ?s ?p ?o }' },
      data => {
        expect(data).toHaveLength(12); // three articles defined in nodeDB
        for (var i = 0; i < data.length; i++) {
          expect(data[i]['@id']).toEqual(expect.anything());
        }

        done();
      }
    );
  });

  it('A graph query could be limited too', done => {
    conn.queryGraph(
      {
        database,
        query:
          'describe <http://localhost/publications/articles/Journal1/1940/Article1>',
        limit: 1,
      },
      data => {
        expect(data).toHaveLength(1);
        expect(data[0]).toHaveProperty('@id');
        done();
      }
    );
  });

  // Revisit this test as it doesn't seem like limit is working here?
  it('should be able to retrieve one triple in turtle format', done => {
    conn.queryGraph(
      {
        database,
        query:
          'describe <http://localhost/publications/articles/Journal1/1940/Article1>',
        mimetype: 'text/turtle',
        limit: 1,
      },
      data => {
        expect(data).toContain(
          '<http://localhost/publications/articles/Journal1/1940/Article1>'
        );
        done();
      }
    );
  });
});
