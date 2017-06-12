const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('deletePermissionFromUser()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should fail trying to delete a permssion to a non-existent user.', done => {
    var aNewPermission = {
      action: 'write',
      resource_type: 'db',
      resource: [database],
    };

    conn.deletePermissionFromUser(
      { user: 'myuser', permissionObj: aNewPermission },
      (data, response) => {
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });

  it('should pass deleting a Permissions to a new user.', done => {
    var aNewUser = generateRandomString(),
      aNewUserPwd = generateRandomString(),
      aNewPermission = {
        action: 'write',
        resource_type: 'db',
        resource: [database],
      };

    // actual test
    conn.createUser(
      { username: aNewUser, password: aNewUserPwd, superuser: true },
      (data1, response1) => {
        expect(response1.statusCode).toEqual(201);

        conn.assignPermissionToUser(
          { user: aNewUser, permissionObj: aNewPermission },
          (data2, response2) => {
            expect(response2.statusCode).toEqual(201);

            conn.deletePermissionFromUser(
              { user: aNewUser, permissionObj: aNewPermission },
              (data3, response3) => {
                expect(response3.statusCode).toEqual(200);
                done();
              }
            );
          }
        );
      }
    );
  });
});
