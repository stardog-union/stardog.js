import { user, role, Connection, Permission } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

describe('user.assignPermission()', () => {
  const database = generateDatabaseName();
  let connection: Connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should pass assinging a permission to a new user.', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    const permission: Permission = {
      action: 'WRITE',
      resourceType: 'db',
      resources: [database],
    };

    return user
      .create({
        connection,
        user: {
          name,
          password,
        },
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.assignPermission({
          connection,
          permission,
          username: name,
        });
      })
      .then((res) => {
        expect(res.status).toBe(201);
      });
  });
});
