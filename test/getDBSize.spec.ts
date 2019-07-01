import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('getDBSize()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('A response with the size of the DB should not be empty', () =>
    db
      .size({ connection, database })
      .then((res) => res.json())
      .then((body) => {
        const sizeNum = parseInt(body, 10);
        expect(sizeNum).toBe(93);
      }));
});
