/* eslint-env jest */

const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

const { role } = require('../lib');

describe('assignPermissionToRole()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should fail trying to assign a permssion to a non-existent role.', () => {
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return role.assignPermission(conn, 'myrole', permission).then(res => {
      expect(res.status).toBe(404);
    });
  });

  it('should pass assinging a Permissions to a new role.', () => {
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
      });
  });
});
