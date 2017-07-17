/* eslint-env jest */

const { user: { role } } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('listRolePermissions()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should fail trying to get the list of permissions of a non-existent role.', () =>
    role.permissions(conn, 'myrole').then(res => {
      expect(res.status).toBe(404);
    }));

  it('should list permissions assigned to a new role.', () => {
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
        return role.permissions(conn, rolename);
      })
      .then(res => {
        expect(res.status).toBe(200);

        expect(res.body.permissions).toEqual(expect.anything());
        expect(res.body.permissions.length).toBeGreaterThan(0);
        expect(res.body.permissions[0].resource).toContain(database);
      });
  });
});
