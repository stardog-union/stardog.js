import { role, Permission } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

describe('listRolePermissions()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should fail trying to get the list of permissions of a non-existent role.', () =>
    role.permissions({ connection, role: { name: 'myrole' } }).then((res) => {
      expect(res.status).toBe(404);
    }));

  it('should list permissions assigned to a new role.', () => {
    const rolename = generateRandomString();
    const permission: Permission = {
      action: 'WRITE',
      resourceType: 'db',
      resources: [database],
    };

    return role
      .create({ connection, role: { name: rolename } })
      .then((res) => {
        expect(res.status).toBe(201);
        return role.assignPermission({
          connection,
          role: { name: rolename },
          permission,
        });
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return role.permissions({ connection, role: { name: rolename } });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => {
        expect(body.permissions).toEqual(expect.anything());
        expect(body.permissions.length).toBeGreaterThan(0);
        expect(body.permissions[0].resource).toContain(database);
      });
  });
});
