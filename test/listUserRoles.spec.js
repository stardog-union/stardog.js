/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

const { role } = user;

describe('listUserRoles()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return NOT_FOUND if trying to list roles from non-existent user', () =>
    user.listRoles(conn, generateRandomString()).then(res => {
      expect(res.status).toBe(404);
    }));

  it('should return a non-empty list with the roles of the user', () => {
    const r = generateRandomString();
    return role
      .create(conn, {
        name: r,
      })
      .then(() =>
        user.create(conn, { username: 'anonymous', password: 'anonymous' })
      )
      .then(() => user.setRoles(conn, 'anonymous', [r]))
      .then(() => user.listRoles(conn, 'anonymous'))
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.roles).toContain(r);
      });
  });
});
