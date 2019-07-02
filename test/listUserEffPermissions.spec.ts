import { user, Permission } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

describe('listUserEffPermissions()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should fail trying to get the list of effective permissions of a non-existent user.', () =>
    user
      .effectivePermissions({ connection, username: 'myuser' })
      .then((res) => {
        expect(res.status).toBe(404);
      }));

  it('should list effective permissions assigned to a new user.', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    const permission: Permission = {
      action: 'write',
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
      .then(() =>
        user.assignPermission({ connection, username: name, permission })
      )
      .then(() => user.effectivePermissions({ connection, username: name }))
      .then((res) => res.json())
      .then((body) => {
        expect(body.permissions.length).toBeGreaterThan(0);
        expect(body.permissions).toContainEqual({
          action: 'WRITE',
          resource: [database],
          resource_type: 'db',
        });
      });
  });
});
