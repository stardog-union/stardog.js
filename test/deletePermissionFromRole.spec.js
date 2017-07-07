const { role } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('deletePermissionFromRole()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should fail trying to delete a permssion from a non-existent role.', () => {
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return role.deletePermission(conn, 'myrole', permission).then(res => {
      expect(res.status).toBe(404);
    });
  });

  it('should pass deleting Permissions from a new role.', () => {
    const rolename = generateRandomString();
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return role
      .create(conn, { name: rolename })
      .then(res => {
        expect(res.status).toBe(201);
        return role.assignPermission(conn, rolename, permission);
      })
      .then(res => {
        expect(res.status).toBe(201);
        return role.deletePermission(conn, rolename, permission);
      })
      .then(res => {
        expect(res.status).toBe(201);
      });
  });
});
