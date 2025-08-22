/* eslint-env jest */

const { user } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('user.get', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });
  it('should return 200 if a Connection has valid creds', () =>
    user.valid(conn).then((res) => {
      expect(res.status).toBe(200);
    }));
  it('should return 401 for invalid creds', () => {
    conn.config({ password: 'bad' });
    return user.valid(conn).then((res) => {
      expect(res.status).toBe(401);
    });
  });
});
