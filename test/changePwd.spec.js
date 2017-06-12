const Stardog = require('../lib');
const { generateRandomString } = require('./setup-database');

describe('changePwd()', () => {
  var conn;

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
    conn.createUser(
      { username, password, superuser: true },
      (data, response) => {
        // It should be 201 (CREATED)
        expect(response.statusCode).toEqual(201);

        conn.changePwd(
          { user: username, newPwd: password },
          (data1, response1) => {
            expect(response1.statusCode).toEqual(200);
            conn.setCredentials('admin', 'admin');

            // update conn with new credentials
            conn.setCredentials('newuser', 'somepwd');

            // call to list DBs should be able to be done.
            conn.listDBs((data2, response2) => {
              expect(response2.statusCode).toEqual(200);
              expect(data2.databases).toEqual(expect.anything());
              done();
            });
          }
        );
      }
    );
  });
});
