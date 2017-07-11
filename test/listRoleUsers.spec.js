/* eslint-env jest */

const { role, user } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

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
    return role
      .create(conn, { name: rolename })
      .then(() => user.setRoles(conn, 'anonymous', [rolename]))
      .then(() => role.usersWithRole(conn, rolename))
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.result.users).toContain('anonymous');
      });
  });
});
