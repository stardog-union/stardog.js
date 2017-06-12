const Stardog = require('../lib');
const { generateRandomString } = require('./setup-database');

describe('Set User Roles Test Suite', () => {
  var conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  afterEach(() => {
    conn = null;
  });

  it('should return NOT_FOUND trying to set roles to a non-existent user.', done => {
    conn.setUserRoles(
      { user: generateRandomString(), roles: ['reader'] },
      (data, response) => {
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });

  it('should assign roles to a newly created user.', done => {
    const username = generateRandomString();
    const password = generateRandomString();
    // clean and delete the user
    conn.createUser(
      {
        username,
        password,
        superuser: true,
      },
      () => {
        conn.setUserRoles(
          { user: username, roles: ['reader'] },
          (data, response) => {
            expect(response.statusCode).toEqual(200);
            done();
          }
        );
      }
    );
  });
});
