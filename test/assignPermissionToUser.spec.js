const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('assignPermissionToUser()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should fail trying to assign a permssion to a non-existent user.', done => {
    const aNewPermission = {
      action: 'write',
      resource_type: 'db',
      resource: [database],
    };

    conn.assignPermissionToUser(
      { user: 'myuser', permissionObj: aNewPermission },
      (data, response) => {
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });

  it('should pass assinging a Permissions to a new user.', done => {
    const username = generateRandomString(),
      password = generateRandomString(),
      aNewPermission = {
        action: 'write',
        resource_type: 'db',
        resource: [database],
      };

    conn.createUser(
      { username, password, superuser: true },
      (data, response1) => {
        expect(response1.statusCode).toEqual(201);

        conn.assignPermissionToUser(
          { user: username, permissionObj: aNewPermission },
          (data, response2) => {
            expect(response2.statusCode).toEqual(201);
            done();
          }
        );
      }
    );
  });
});
