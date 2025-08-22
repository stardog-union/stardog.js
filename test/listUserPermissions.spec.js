/* eslint-env jest */

const { user } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('listUserPermissions()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should fail trying to get the list of permissions of a non-existent user.', () =>
    user.permissions(conn, 'myuser').then((res) => {
      expect(res.status).toBe(404);
    }));

  it('should list permissions assigned to a new user.', () => {
    const username = generateRandomString();
    const password = generateRandomString();
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return user
      .create(conn, { username, password })
      .then(() => user.assignPermission(conn, username, permission))
      .then(() => user.permissions(conn, username))
      .then((res) => {
        expect(res.status).toBe(200);
        const resources = res.body.permissions.reduce(
          (memo, perm) => memo.concat(perm.resource),
          []
        );
        expect(resources).toContain(database);
      });
  });
});
