import { role, Permission } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

describe('deletePermissionFromRole()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should fail trying to delete a permssion from a non-existent role.', () => {
    const permission: Permission = {
      action: 'WRITE',
      resourceType: 'db',
      resources: [database],
    };

    return role
      .deletePermission({ connection, role: { name: 'myrole' }, permission })
      .then((res) => {
        expect(res.status).toBe(404);
      });
  });

  it('should pass deleting Permissions from a new role.', () => {
    const rolename = generateRandomString();
    const permission: Permission = {
      action: 'WRITE',
      resourceType: 'db',
      resources: [database],
    };
    const roleUpdate = {
      name: rolename,
    };

    return role
      .create({ connection, role: roleUpdate })
      .then((res) => {
        expect(res.status).toBe(201);
        return role.assignPermission({
          connection,
          role: roleUpdate,
          permission,
        });
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return role.deletePermission({
          connection,
          role: roleUpdate,
          permission,
        });
      })
      .then((res) => {
        expect(res.status).toBe(201);
      });
  });
});
