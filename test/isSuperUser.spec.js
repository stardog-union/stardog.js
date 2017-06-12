const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('isSuperUser()', () => {
  var conn;

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

  it("should return the value with the user's superuser flag", done => {
    conn.isSuperUser({ user: 'admin' }, (data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.superuser).toEqual(true);
      done();
    });
  });
});
