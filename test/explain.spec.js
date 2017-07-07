const { query } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('queryExplain()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({ database });
  });

  it('A response with the query plan should not be empty', () => {
    return query
      .explain(conn, 'select ?s where { ?s ?p ?o } limit 10')
      .then(({ result }) => {
        expect(result).toContain('Slice(offset=0, limit=10)');
        expect(result).toContain('Projection(?s)');
        expect(result).toContain('Scan');
      });
  });
});
