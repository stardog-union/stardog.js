const Stardog = require('../lib');
const { generateRandomString } = require('./setup-database');

describe('changePwd()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should fail trying to change a password (char[]) from an non-existent user', done => {
    conn.changePwd(
      { user: 'someuser', newPwd: 'somepwd' },
      (data, response) => {
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });

  it('should change the password and allow calls with new credentials', done => {
    const username = generateRandomString();
    const password = generateRandomString();
    const newPassword = generateRandomString();
    conn.createUser({ username, password, superuser: true }, (data, res) => {
      // It should be 201 (CREATED)
      expect(res.statusCode).toEqual(201);

      conn.changePwd({ user: username, newPwd: newPassword }, (data, res) => {
        expect(res.statusCode).toEqual(200);
        conn.setCredentials('admin', 'admin');

        // update conn with new credentials
        conn.setCredentials(username, newPassword);

        // call to list DBs should be able to be done.
        conn.listDBs((data, res) => {
          expect(res.statusCode).toEqual(200);
          expect(data.databases).toEqual(expect.anything());
          done();
        });
      });
    });
  });
});
