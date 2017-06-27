const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('isSuperUser()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should get NOT_FOUND for a non-existent user', done => {
    conn.isSuperUser({ user: 'someuser' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it("should return the value with the user's superuser flag (true)", done => {
    conn.isSuperUser({ user: 'admin' }, (data, response) => {
      expect(data.superuser).toEqual(true);
      done();
    });
  });

  it("should return the value with the user's superuser flag (false)", done => {
    const username = generateRandomString();
    const password = generateRandomString();

    conn.createUser({ username, password, superuser: false }, (data, res) => {
      expect(res.statusCode).toEqual(201);

      conn.isSuperUser({ user: username }, (data, res) => {
        expect(data.superuser).toEqual(false);
        done();
      });
    });
  });
});
