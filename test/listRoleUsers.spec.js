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

describe('listRoleUsers()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it("should return a list of users assigned to the 'rolename' role in the system.", () => {
    const rolename = generateRandomString();
    user.create(conn, {
      username: 'anonymous',
      password: 'anonymous',
    });
    return role
      .create(conn, { name: rolename })
      .then(() =>
        user.create(conn, { username: 'anonymous', password: 'anonymous' })
      )
      .then(() => user.setRoles(conn, 'anonymous', [rolename]))
      .then(() => role.usersWithRole(conn, rolename))
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body.users).toContain('anonymous');
      });
  });
});
