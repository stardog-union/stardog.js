const Stardog = require('../lib');
const { generateRandomString } = require('./setup-database');

describe('userEnabled()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  afterEach(() => {
    conn = null;
  });

  it('should return NOT_FOUND trying to enable a non-existent user.', done => {
    conn.userEnabled(
      { user: 'someuser', enableFlag: true },
      (data, response) => {
        expect(response.statusCode).toEqual(404);

        done();
      }
    );
  });

  it('should enable a user recently created.', done => {
    const username = generateRandomString();
    const password = generateRandomString();
    conn.createUser({ username, password, superuser: true }, (data, res) => {
      // It should be 201 (CREATED)
      expect(res.statusCode).toEqual(201);

      // Once created then lets delete it.
      conn.userEnabled({ user: username, enableFlag: true }, (data, res) => {
        expect(res.statusCode).toEqual(200);

        conn.isUserEnabled({ user: username }, (data, res) => {
          expect(res.statusCode).toEqual(200);
          expect(data.enabled).toEqual(true);
          done();
        });
      });
    });
  });
});
