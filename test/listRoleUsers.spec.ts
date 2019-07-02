import { user, role } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

describe('listRoleUsers()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it("should return a list of users assigned to the 'rolename' role in the system.", () => {
    const rolename = generateRandomString();
    return role
      .create({ connection, role: { name: rolename } })
      .then(() =>
        user.setRoles({ connection, username: 'anonymous', roles: [rolename] })
      )
      .then(() => role.usersWithRole({ connection, role: { name: rolename } }))
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((body) => expect(body.users).toContain('anonymous'));
  });
});
