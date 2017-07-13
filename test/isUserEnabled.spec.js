/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('user.enabled()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should get NOT_FOUND for a non-existent user', () =>
    user.enabled(conn, 'someuser').then(res => {
      expect(res.status).toEqual(404);
    }));

  it("should return the value with the user's enabled flag", () =>
    user.enabled(conn, 'admin').then(res => {
      expect(res.body.enabled).toEqual(true);
    }));

  it("should return the value with the user's superuser flag (false)", () => {
    const name = generateRandomString();
    const password = generateRandomString();

    return user
      .create(conn, {
        name,
        password,
      })
      .then(res => {
        expect(res.status).toEqual(201);
        return user.enable(conn, name, false);
      })
      .then(() => user.enabled(conn, name))
      .then(res => {
        expect(res.body.enabled).toEqual(false);
      });
  });
});
