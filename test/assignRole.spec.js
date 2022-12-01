/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('Assign User Role Test Suite', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to add role to a non-existent user.', () =>
    user.assignRole(conn, generateRandomString(), 'reader').then(res => {
      expect(res.status).toBe(404);
    }));

  it('should add role to a newly created user.', () => {
    const name = generateRandomString();
    const password = generateRandomString() + generateRandomString();
    return user
      .create(conn, {
        name,
        password,
      })
      .then(() => user.role.create(conn, { name: 'other_role' }))
      .then(() => user.assignRole(conn, name, 'reader'))
      .then(() => user.assignRole(conn, name, 'other_role'))
      .then(res => {
        expect(res.status).toBe(204);
        return user.listRoles(conn, name);
      })
      .then(res => {
        expect(res.body.roles).toContain('reader');
        expect(res.body.roles).toContain('other_role');
      });
  });
});
