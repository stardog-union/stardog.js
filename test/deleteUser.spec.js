const Stardog = require('../lib');
const { generateRandomString } = require('./setup-database');

describe('deleteUser()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should return NOT_FOUND trying to delete a non-existent user.', done => {
    conn.deleteUser({ user: 'someuser' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it('should delete a supplied user recently created.', done => {
    const username = generateRandomString();
    conn.createUser(
      { username, password: 'newuser', superuser: true },
      (data, response) => {
        // It should be 201 (CREATED)
        expect(response.statusCode).toEqual(201);

        // Once created then lets delete it.
        conn.deleteUser({ user: username }, (data, response) => {
          expect(response.statusCode).toEqual(204);
          done();
        });
      }
    );
  });
});
