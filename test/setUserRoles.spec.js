/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('Set User Roles Test Suite', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to set roles to a non-existent user.', () =>
    user.setRoles(conn, generateRandomString(), ['reader']).then(res => {
      expect(res.status).toBe(404);
    }));

  it('should assign roles to a newly created user.', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    return user
      .create(conn, {
        name,
        password,
      })
      .then(() => user.setRoles(conn, name, ['reader']))
      .then(res => {
        expect(res.status).toBe(200);
        return user.listRoles(conn, name);
      })
      .then(res => {
        expect(res.body.roles).toContain('reader');
      });
  });
});
