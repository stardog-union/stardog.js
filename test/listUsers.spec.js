/* eslint-env jest */

const { user } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('List Users Test Suite', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return a list of current registered users in the system.', () =>
    user.list(conn).then((res) => {
      expect(res.status).toEqual(200);
      expect(res.body.users).toContain('admin');
    }));
});
