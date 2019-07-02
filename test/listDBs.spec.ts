import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('listDBs()', () => {
  const one = generateDatabaseName();
  const two = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(one));
  beforeAll(seedDatabase(two));
  afterAll(dropDatabase(one));
  afterAll(dropDatabase(two));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should list available databases', () => {
    db
      .list({ connection })
      .then((res) => res.json())
      .then((body) =>
        expect(body.databases).toEqual(expect.arrayContaining([one, two]))
      );
  });
});
