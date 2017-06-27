const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('isUserEnabled()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should get NOT_FOUND for a non-existent user', done => {
    conn.isUserEnabled({ user: 'someuser' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it("should return the value with the user's enabled flag", done => {
    conn.isUserEnabled({ user: 'admin' }, (data, response) => {
      expect(data.enabled).toEqual(true);
      done();
    });
  });

  it("should return the value with the user's superuser flag (false)", done => {
    const username = generateRandomString();
    const password = generateRandomString();

    conn.createUser({ username, password }, (data, res) => {
      expect(res.statusCode).toEqual(201);

      conn.userEnabled(
        {
          user: username,
          enableFlag: false,
        },
        () => {
          conn.isUserEnabled({ user: username }, (data, res) => {
            expect(data.enabled).toEqual(false);
            done();
          });
        }
      );
    });
  });
});
