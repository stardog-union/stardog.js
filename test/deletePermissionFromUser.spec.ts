import { user, Permission } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

describe('deletePermissionFromUser()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should fail trying to delete a permssion to a non-existent user.', () => {
    const permission: Permission = {
      action: 'WRITE',
      resourceType: 'db',
      resources: [database],
    };

    return user
      .deletePermission({ connection, username: 'myuser', permission })
      .then((res) => {
        expect(res.status).toBe(404);
      });
  });

  it('should pass deleting a Permissions to a new user.', () => {
    const username = generateRandomString();
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
          name: username,
          password,
        },
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.assignPermission({ connection, username, permission });
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.deletePermission({ connection, username, permission });
      })
      .then((res) => {
        expect(res.status).toBe(201);
      });
  });
});
