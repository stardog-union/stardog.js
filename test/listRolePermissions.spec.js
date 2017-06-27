const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');
describe('listRolePermissions()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should fail trying to get the list of permissions of a non-existent role.', done => {
    conn.listRolePermissions({ role: 'myrole' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it('should list permissions assigned to a new role.', done => {
    const aNewRole = generateRandomString();
    const aNewPermission = {
      action: 'write',
      resource_type: 'db',
      resource: [database],
    };

    conn.createRole({ rolename: aNewRole }, (data1, response1) => {
      expect(response1.statusCode).toEqual(201);

      conn.assignPermissionToRole(
        { role: aNewRole, permissionObj: aNewPermission },
        (data2, response2) => {
          expect(response2.statusCode).toEqual(201);

          // list permissions to new role should include recently added.
          conn.listRolePermissions({ role: aNewRole }, (data3, response3) => {
            expect(response3.statusCode).toEqual(200);

            expect(data3.permissions).toEqual(expect.anything());
            expect(data3.permissions.length).toBeGreaterThan(0);
            expect(data3.permissions[0].resource).toContain(database);
            done();
          });
        }
      );
    });
  });
});
