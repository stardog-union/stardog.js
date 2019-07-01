import { query } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('query.property()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('Gets a specific property from the database', () =>
    query
      .property({
        connection,
        database,
        uri: '<http://localhost/publications/articles/Journal1/1940/Article1>',
        property: '<http://localhost/vocabulary/bench/cdrom>',
      })
      .then((res) => res.json())
      .then((json) =>
        expect(json.body).toEqual(
          'http://www.hogfishes.tld/richer/succories.html'
        )
      ));
});
