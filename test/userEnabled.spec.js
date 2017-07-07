const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('userEnabled()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to enable a non-existent user.', () => {
    return user.enabled(conn, 'someuser').then(res => {
      expect(res.status).toBe(404);
    });
  });

  it('should enable a user recently created.', () => {
    const username = generateRandomString();
    const password = generateRandomString();
    return user
      .create(conn, { username, password })
      .then(res => {
        expect(res.status).toBe(201);
        return user.enable(conn, username, true);
      })
      .then(res => {
        expect(res.status).toBe(200);
        return user.enabled(conn, username);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result.enabled).toBe(true);
      });
  });
});
