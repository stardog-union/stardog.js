const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('listUserEffPermissions()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should fail trying to get the list of effective permissions of a non-existent user.', done => {
    conn.listUserEffPermissions({ user: 'myuser' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it('should list effective permissions assigned to a new user.', done => {
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
            // list permissions to new role should include recently added.
            conn.listUserEffPermissions(
              { user: aNewUser },
              (data, response) => {
                expect(data.permissions.length).toBeGreaterThan(0);
                expect(data.permissions).toContainEqual({
                  action: 'WRITE',
                  resource: [database],
                  resource_type: 'db',
                });
                done();
              }
            );
          }
        );
      }
    );
  });
});
