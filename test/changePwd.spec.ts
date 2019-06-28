import { user, db, Connection } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateRandomString,
  generateDatabaseName,
  ConnectionFactory,
} from './setup-database';

describe('changePwd()', () => {
  const database = generateDatabaseName();
  let connection: Connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('should fail trying to change a password (char[]) from an non-existent user', () =>
    user
      .changePassword({
        connection,
        username: 'someuser',
        password: 'passworddd',
      })
      .then((res) => {
        expect(res.status).toEqual(404);
      }));

  it('should change the password and allow calls with new credentials', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    const newPassword = generateRandomString();
    return user
      .create({
        connection,
        user: {
          name,
          password,
          superuser: true,
        },
      })
      .then((res) => {
        expect(res.status).toEqual(201);
        return user.changePassword({
          connection,
          username: name,
          password: newPassword,
        });
      })
      .then((res) => {
        expect(res.status).toEqual(200);
        // Switch to new user
        connection.configure({
          username: name,
          password: newPassword,
        });
        return db.list({ connection });
      })
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((bodyJson) => {
        expect(bodyJson.databases.length).toBeGreaterThan(0);
      });
  });
});
