import { db } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

const { options } = db;

describe('db.setOptions()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should get NOT_FOUND status code trying to set the options of a non-existent DB.', () =>
    options
      .set({
        connection,
        database: 'nodeDB_test',
        databaseOptions: {
          query: {
            all: {
              graphs: true,
            },
          },
          transaction: {
            logging: true,
          },
        },
      })
      .then((res) => {
        expect(res.status).toEqual(404);
      }));

  it('should set the options of an DB', () =>
    db
      .offline({ connection, database })
      .then(() =>
        options.set({
          connection,
          database,
          databaseOptions: {
            query: {
              all: {
                graphs: true,
              },
            },
            transaction: {
              logging: true,
            },
          },
        })
      )
      .then((res) => {
        expect(res.status).toBe(200);
      }));
});
