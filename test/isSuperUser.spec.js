/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('isSuperUser()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should indicate superuser flag as false for a non-existent user', () =>
    user.superUser(conn, 'someuser').then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.superuser).toBe(false);
    }));

  it("should return the value with the user's superuser flag (true)", () =>
    user.superUser(conn, 'admin').then((res) => {
      expect(res.body.superuser).toBe(true);
    }));

  it("should return the value with the user's superuser flag (false)", () => {
    const username = generateRandomString();
    const password = generateRandomString();

    return user
      .create(conn, { username, password })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.superUser(conn, username);
      })
      .then((res) => {
        expect(res.body.superuser).toBe(false);
      });
  });
});
