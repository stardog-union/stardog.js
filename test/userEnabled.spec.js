/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

describe('userEnabled()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should indicate enabled flag as false for a non-existent user.', () =>
    user.enabled(conn, 'someuser').then(res => {
      expect(res.status).toBe(200);
      expect(res.body.enabled).toBe(false);
    }));

  it('should enable a user recently created.', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    return user
      .create(conn, { name, password })
      .then(res => {
        expect(res.status).toBe(201);
        return user.enable(conn, name, true);
      })
      .then(res => {
        expect(res.status).toBe(200);
        return user.enabled(conn, name);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.enabled).toBe(true);
      });
  });
});
