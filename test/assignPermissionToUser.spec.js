/* eslint-env jest */

const { user } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

const role = user.role;

describe('assignPermissionToUser()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should fail trying to assign a permssion to a non-existent user.', () => {
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return role.assignPermission(conn, 'myuser', permission).then((res) => {
      expect(res.status).toEqual(404);
    });
  });

  it('should pass assinging a Permissions to a new user.', () => {
    const username = generateRandomString();
    const password = generateRandomString();
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return user
      .create(conn, {
        username,
        password,
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.assignPermission(conn, username, permission);
      })
      .then((res) => {
        expect(res.status).toBe(201);
      });
  });
});
