/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('Add User Role Test Suite', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to add role to a non-existent user.', () =>
    user.addRole(conn, generateRandomString(), 'reader').then(res => {
      expect(res.status).toBe(404);
    }));

  it('should add role to a newly created user.', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    return user
      .create(conn, {
        name,
        password,
      })
      .then(() => user.addRole(conn, name, 'reader'))
      .then(() => user.addRole(conn, name, 'cloud'))
      .then(res => {
        expect(res.status).toBe(200);
        return user.listRoles(conn, name);
      })
      .then(res => {
        expect(res.body.roles).toContain('reader');
        expect(res.body.roles).toContain('cloud');
      });
  });
});
