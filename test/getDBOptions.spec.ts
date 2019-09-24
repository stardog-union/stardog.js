import { options } from '../lib/db';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';
import { unflatten } from 'flat';

describe('options.get()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should get NOT_FOUND status code trying to get the options of a non-existent DB.', () =>
    options.get({ connection, database: 'nodeDB_test' }).then((res) => {
      expect(res.status).toEqual(404);
    }));

  it('should get the options of a DB', () =>
    options
      .get({ connection, database })
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((body) =>
        expect(unflatten(body)).toMatchObject({
          index: {
            type: 'Disk',
          },
        })
      ));
});

describe('options.getAll()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should get all db config properties', () =>
    options
      .getAll({ connection, database })
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      // FIXME: We need a better test than this:
      .then((resJson) => expect(typeof resJson).toEqual('object')));
});

describe('options.getAvailable', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should get all available config properties', () =>
    options
      .getAvailable({ connection })
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      // FIXME: We need a better test than this:
      .then((resJson) => expect(typeof resJson).toEqual('object')));
});
