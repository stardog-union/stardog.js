const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('listRoleUsers()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it("should return a list of users assigned to the 'rolename' role in the system.", done => {
    const rolename = generateRandomString();
    conn.createRole({ rolename }, () => {
      conn.setUserRoles({ user: 'anonymous', roles: [rolename] }, () => {
        conn.listRoleUsers({ role: rolename }, (data, response) => {
          expect(response.statusCode).toEqual(200);
          expect(data.users).toContain('anonymous');
          done();
        });
      });
    });
  });
});
