import { db } from '../lib';
import {
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('createDB()', () => {
  const database = generateDatabaseName();
  let connection;

  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should not be able to create a new db with the name of an existing DB', () =>
    db
      .create({
        connection,
        database,
        databaseSettings: {
          index: {
            type: 'disk',
          },
        },
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return db.create({ connection, database });
      })
      .then((res) => {
        expect(res.status).toBe(409);
      }));
});
