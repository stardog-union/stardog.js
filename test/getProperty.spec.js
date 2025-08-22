/* eslint-env jest */

const { query } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('query.property()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({ database });
  });

  it('Gets a specific property from the database', () =>
    query
      .property(conn, database, {
        uri: '<http://localhost/publications/articles/Journal1/1940/Article1>',
        property: '<http://localhost/vocabulary/bench/cdrom>',
      })
      .then(res => {
        expect(res.body).toEqual(
          'http://www.hogfishes.tld/richer/succories.html'
        );
      }));
});
