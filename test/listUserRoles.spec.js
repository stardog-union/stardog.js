const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('listUserRoles()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  afterEach(() => {
    conn = null;
  });

  it('should return NOT_FOUND if trying to list roles from non-existent user', done => {
    conn.listUserRoles({ user: 'someuser' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it('should return a non-empty list with the roles of the user', done => {
    const role = generateRandomString();
    conn.createRole({ rolename: role }, () => {
      conn.setUserRoles({ user: 'anonymous', roles: [role] }, () => {
        conn.listUserRoles({ user: 'anonymous' }, (data, response) => {
          expect(response.statusCode).toEqual(200);
          expect(data.roles).toContain(role);
          done();
        });
      });
    });
  });
});
