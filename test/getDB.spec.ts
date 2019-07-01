import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('getDB()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('A response of the DB info should not be empty', () =>
    db
      .getDatabase({ connection, database })
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.text();
      })
      .then((text) => {
        expect(text.length).toBeGreaterThan(0);
        expect(
          text.includes(
            'overbites terminals giros podgy vagus kinkiest xix recollected'
          )
        ).toBe(true);
      }));
});
