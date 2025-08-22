/* eslint-env jest */

const { user } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('whoAmI', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it("should return the current user's username.", () =>
    user.whoAmI(conn).then(res => {
      expect(res.status).toEqual(200);
      expect(conn.username).toBeTruthy();
      expect(res.body).toEqual(conn.username);
    }));
});
