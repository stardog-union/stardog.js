/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('isSuperUser()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should get NOT_FOUND for a non-existent user', () =>
    user.superUser(conn, 'someuser').then(res => {
      expect(res.status).toBe(404);
    }));

  it("should return the value with the user's superuser flag (true)", () =>
    user.superUser(conn, 'admin').then(res => {
      expect(res.result.superuser).toBe(true);
    }));

  it("should return the value with the user's superuser flag (false)", () => {
    const name = generateRandomString();
    const password = generateRandomString();

    return user
      .create(conn, {
        name,
        password,
        superuser: false,
      })
      .then(res => {
        expect(res.status).toBe(201);
        return user.superUser(conn, name);
      })
      .then(res => {
        expect(res.result.superuser).toBe(false);
      });
  });
});
