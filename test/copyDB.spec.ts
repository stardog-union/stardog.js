import { db, Connection } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('db.copy()', () => {
  const database = generateDatabaseName();
  const destination = generateDatabaseName();
  let connection: Connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));
  afterAll(dropDatabase(destination));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should not copy an online DB', () =>
    db
      .copy({
        connection,
        database,
        destination,
      })
      .then(() =>
        db.list({
          connection,
        })
      )
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((bodyJson) => {
        // Destination shouldn't be listed because it's not online yet and therefore didn't get copied.
        expect(bodyJson.databases).not.toContain(destination);
        expect(bodyJson.databases).toContain(database);
      }));

  it('should copy an offline DB', () =>
    db
      .offline({
        connection,
        database,
      })
      .then(() => db.copy({ connection, database, destination }))
      .then(() =>
        db.list({
          connection,
        })
      )
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((bodyJson) => {
        expect(bodyJson.databases).toContain(destination);
        expect(bodyJson.databases).toContain(database);
      }));
});
