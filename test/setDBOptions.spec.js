/* eslint-env jest */

const { db } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('db.setOptions()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should get NOT_FOUND status code trying to set the options of a non-existent DB.', () =>
    db
      .setOptions(conn, 'nodeDB_test', {
        query: {
          all: {
            graphs: true,
          },
        },
        transaction: {
          logging: true,
        },
      })
      .then(res => {
        expect(res.status).toEqual(404);
      }));

  it('should set the options of an DB', () =>
    db
      .offline(conn, database)
      .then(() =>
        db.setOptions(conn, database, {
          query: {
            all: {
              graphs: true,
            },
          },
          transaction: {
            logging: true,
          },
        })
      )
      .then(res => {
        expect(res.status).toBe(200);
      }));
});
