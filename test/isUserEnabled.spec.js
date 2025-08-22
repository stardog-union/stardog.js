/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('user.enabled()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should indicate enabled flag as false for a non-existent user.', () =>
    user.enabled(conn, 'someuser').then((res) => {
      expect(res.status).toBe(200);
      expect(res.body.enabled).toBe(false);
    }));

  it("should return the value with the user's enabled flag", () =>
    user.enabled(conn, 'admin').then((res) => {
      expect(res.body.enabled).toEqual(true);
    }));

  it("should return the value with the user's superuser flag (false)", () => {
    const username = generateRandomString();
    const password = generateRandomString();

    return user
      .create(conn, { username, password })
      .then((res) => {
        expect(res.status).toEqual(201);
        return user.enable(conn, username, false);
      })
      .then(() => user.enabled(conn, username))
      .then((res) => {
        expect(res.body.enabled).toEqual(false);
      });
  });
});
