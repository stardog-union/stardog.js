import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('optimizeDB()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should get NOT_FOUND status code trying to optimize a non-existent DB.', () =>
    db.optimize({ connection, database: 'nodeDB_optimize' }).then((res) => {
      expect(res.status).toEqual(404);
    }));

  it('should optimize an online DB', () =>
    db.optimize({ connection, database }).then((res) => {
      expect(res.status).toEqual(200);
    }));
});
