import { user, Permission } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

describe('listUserPermissions()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should fail trying to get the list of permissions of a non-existent user.', () =>
    user.permissions({ connection, username: 'myuser' }).then((res) => {
      expect(res.status).toBe(404);
    }));

  it('should list permissions assigned to a new user.', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    const permission: Permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return user
      .create({
        connection,
        user: {
          name,
          password,
        },
      })
      .then(() =>
        user.assignPermission({ connection, username: name, permission })
      )
      .then(() => user.permissions({ connection, username: name }))
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => {
        const resources = body.permissions.reduce(
          (memo, perm) => memo.concat(perm.resource),
          []
        );
        expect(resources).toContain(database);
      });
  });
});
