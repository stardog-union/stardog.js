const Stardog = require('../lib');
const { generateRandomString } = require('./setup-database');

describe('userEnabled()', () => {
  var conn;

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
    conn.createUser(
      { username, password, superuser: true },
      (data1, response1) => {
        // It should be 201 (CREATED)
        expect(response1.statusCode).toEqual(201);

        // Once created then lets delete it.
        conn.userEnabled(
          { user: 'newuser', enableFlag: true },
          (data2, response2) => {
            expect(response2.statusCode).toEqual(200);

            conn.isUserEnabled({ user: 'newuser' }, (data3, response3) => {
              expect(response3.statusCode).toEqual(200);
              expect(data3.enabled).toEqual(true);
              done();
            });
          }
        );
      }
    );
  });
});
