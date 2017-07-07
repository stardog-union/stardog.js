const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('deleteUser()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to delete a non-existent user.', () => {
    return user.delete(conn, generateRandomString()).then(res => {
      expect(res.status).toBe(404);
    });
  });

  it('should delete a supplied user recently created.', () => {
    const name = generateRandomString();
    return user
      .create(conn, {
        name,
        password: generateRandomString(),
      })
      .then(res => {
        expect(res.status).toBe(201);
        return user.delete(conn, name);
      })
      .then(res => {
        expect(res.status).toBe(204);
      });
  });
});
