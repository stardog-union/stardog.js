import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';
import { role, Permission } from '../lib';

describe('assignPermissionToRole()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should fail trying to assign a permssion to a non-existent role.', () => {
    const permission: Permission = {
      action: 'WRITE',
      resourceType: 'db',
      resources: [database],
    };

    return role
      .assignPermission({
        connection,
        role: {
          name: 'myrole',
        },
        permission,
      })
      .then((res) => {
        expect(res.status).toBe(404);
      });
  });

  it('should pass assinging a Permissions to a new role.', () => {
    const rolename = generateRandomString();
    const permission: Permission = {
      action: 'WRITE',
      resourceType: 'db',
      resources: [database],
    };

    return role
      .create({
        connection,
        role: {
          name: encodeURIComponent(rolename),
        },
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return role.assignPermission({
          connection,
          role: {
            name: encodeURIComponent(rolename),
          },
          permission,
        });
      })
      .then((res) => {
        expect(res.status).toBe(201);
      });
  });
});
