const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('listUserPermissions()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should fail trying to get the list of permissions of a non-existent user.', done => {
    conn.listUserPermissions({ user: 'myuser' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it('should list permissions assigned to a new user.', done => {
    var aNewUser = generateRandomString(),
      aNewUserPwd = generateRandomString(),
      aNewPermission = {
        action: 'write',
        resource_type: 'db',
        resource: [database],
      };

    conn.createUser(
      { username: aNewUser, password: aNewUserPwd, superuser: true },
      () => {
        conn.assignPermissionToUser(
          { user: aNewUser, permissionObj: aNewPermission },
          () => {
            conn.listUserPermissions({ user: aNewUser }, (data, response) => {
              expect(response.statusCode).toBe(200);
              const resources = data.permissions.reduce(
                (memo, perm) => memo.concat(perm.resource),
                []
              );
              expect(resources).toContain(database);
              done();
            });
          }
        );
      }
    );
  });
});
