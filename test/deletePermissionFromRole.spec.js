const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('deletePermissionFromRole()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should fail trying to delete a permssion from a non-existent role.', done => {
    var aNewPermission = {
      action: 'write',
      resource_type: 'db',
      resource: [database],
    };

    conn.deletePermissionFromRole(
      { role: 'myrole', permissionObj: aNewPermission },
      (data, response) => {
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });

  it('should pass deleting Permissions from a new role.', done => {
    var aNewRole = generateRandomString();
    var aNewPermission = {
      action: 'write',
      resource_type: 'db',
      resource: [database],
    };

    conn.createRole({ rolename: aNewRole }, (data1, response1) => {
      expect(response1.statusCode).toEqual(201);

      // Add permissions to role
      conn.assignPermissionToRole(
        { role: aNewRole, permissionObj: aNewPermission },
        (data2, response2) => {
          expect(response2.statusCode).toEqual(201);

          conn.deletePermissionFromRole(
            { role: aNewRole, permissionObj: aNewPermission },
            (data3, response3) => {
              expect(response3.statusCode).toEqual(200);
              done();
            }
          );
        }
      );
    });
  });
});
