import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';
import { role, Permission } from '../lib';

describe('role.assignPermission()', () => {
  const database = generateDatabaseName();
  const permission: Permission = {
    action: 'WRITE',
    resourceType: 'db',
    resources: [database],
  };
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should fail trying to assign a permssion to a non-existent role.', () => {
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

  it('should fail trying to assign a permission to a non-existent user.', () => {
    return role
      .assignPermission({
        connection,
        permission,
        role: {
          name: 'myuser',
        },
      })
      .then((res) => {
        expect(res.status).toEqual(404);
      });
  });

  it('should pass assinging a permission to a new role.', () => {
    const rolename = generateRandomString();
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
