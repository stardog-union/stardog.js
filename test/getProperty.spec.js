const { Connection, query } = require('../lib/index2');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('query.property()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Connection({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820',
      database,
    });
  });

  it('Gets a specific property from the database', () => {
    return query
      .property(conn, {
        uri: '<http://localhost/publications/articles/Journal1/1940/Article1>',
        property: '<http://localhost/vocabulary/bench/cdrom>',
      })
      .then(res => {
        expect(res.result).toEqual(
          'http://www.hogfishes.tld/richer/succories.html'
        );
      });
  });
});
