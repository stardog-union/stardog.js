import { db } from '../lib';
import {
  seedDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('dropDB()', () => {
  const database = generateDatabaseName();
  const connection = ConnectionFactory();

  beforeAll(seedDatabase(database));
  it('should not drop an non-existent DB', () =>
    db.drop({ connection, database: 'xxxx' }).then((res) => {
      expect(res.status).toBe(404);
    }));

  it('should drop a DB', () =>
    db.drop({ connection, database }).then((res) => {
      expect(res.status).toBe(200);
    }));
});
