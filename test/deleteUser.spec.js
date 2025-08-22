/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('deleteUser()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to delete a non-existent user.', () =>
    user.remove(conn, generateRandomString()).then((res) => {
      expect(res.status).toBe(404);
    }));

  it('should delete a supplied user recently created.', () => {
    const username = generateRandomString();
    const password = generateRandomString();

    return user
      .create(conn, { username, password })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.remove(conn, username);
      })
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });
});
