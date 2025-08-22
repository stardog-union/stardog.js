/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('changePwd()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
    conn.config({});
  });

  it('should fail trying to change a password (char[]) from an non-existent user', () =>
    user.changePassword(conn, 'user', 'password', 'password').then((res) => {
      expect(res.status).toEqual(404);
    }));

  it('should allow a user to change a password with the current password', () => {
    const username = generateRandomString();
    const password = generateRandomString();
    const newPassword = generateRandomString();
    return user
      .create(conn, { username, password })
      .then((res) => {
        expect(res.status).toBe(201);
        // Switch to new user
        conn.config({ username, password });
        return user.changePassword(conn, username, '', newPassword);
      })
      .then((res) => {
        expect(res.status).toEqual(400);
        return user.changePassword(conn, username, newPassword, newPassword);
      })
      .then((res) => {
        expect(res.status).toEqual(403);
        return user.changePassword(conn, username, password, newPassword);
      })
      .then((res) => {
        expect(res.status).toEqual(200);
        // Switch to new user
        conn.config({ username, password: newPassword });
        return user.token(conn);
      })
      .then((res) => {
        expect(res.status).toEqual(200);
      });
  });

  it('should allow a superuser to change the password without the current password', () => {
    const username = generateRandomString();
    const password = generateRandomString();
    const newPassword = generateRandomString();
    return user
      .create(conn, { username, password })
      .then((res) => {
        expect(res.status).toEqual(201);
        return user.changePassword(conn, username, '', newPassword);
      })
      .then((res) => {
        expect(res.status).toEqual(200);
        // Switch to new user
        conn.config({ username, password: newPassword });
        return user.token(conn);
      })
      .then((res) => {
        expect(res.status).toEqual(200);
      });
  });
});
