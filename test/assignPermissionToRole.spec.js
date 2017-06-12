const RandomString = require('randomstring');
const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('assignPermissionToRole()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should fail trying to assign a permssion to a non-existent role.', done => {
    var aNewPermission = {
      action: 'write',
      resource_type: 'db',
      resource: [database],
    };

    conn.assignPermissionToRole(
      { role: 'myrole', permissionObj: aNewPermission },
      (data, response) => {
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });

  it('should pass assinging a Permissions to a new role.', done => {
    var aNewRole = generateRandomString();
    var aNewPermission = {
      action: 'write',
      resource_type: 'db',
      resource: [database],
    };

    conn.createRole({ rolename: aNewRole }, (data, response1) => {
      expect(response1.statusCode).toEqual(201);

      conn.assignPermissionToRole(
        { role: aNewRole, permissionObj: aNewPermission },
        (data, response2) => {
          expect(response2.statusCode).toEqual(201);
          done();
        }
      );
    });
  });
});
