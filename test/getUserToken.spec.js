/* eslint-env jest */

const { user } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('user.token', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });
  it('should return a token when the current connection is valid', () =>
    user.token(conn).then(res => {
      expect(res.status).toBe(200);
      expect(res.body.token).not.toBeUndefined();
    }));
  it('should return 401 for invalid creds', () => {
    conn.config({ password: 'bad' });
    return user.token(conn).then(res => {
      expect(res.status).toBe(401);
    });
  });
});
