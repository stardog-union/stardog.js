const { user } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('listUserEffPermissions()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should fail trying to get the list of effective permissions of a non-existent user.', () => {
    return user.effectivePermissions(conn, 'myuser').then(res => {
      expect(res.status).toBe(404);
    });
  });

  it('should list effective permissions assigned to a new user.', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return user
      .create(conn, {
        name,
        password,
      })
      .then(() => user.assignPermission(conn, name, permission))
      .then(() => user.effectivePermissions(conn, name))
      .then(res => {
        expect(res.result.permissions.length).toBeGreaterThan(0);
        expect(res.result.permissions).toContainEqual({
          action: 'WRITE',
          resource: [database],
          resource_type: 'db',
        });
      });
  });
});
