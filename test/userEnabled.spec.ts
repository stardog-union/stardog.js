import { user } from '../lib';
import { generateRandomString, ConnectionFactory } from './setup-database';

describe('userEnabled()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to enable a non-existent user.', () =>
    user.enabled({ connection, username: 'someuser' }).then((res) => {
      expect(res.status).toBe(404);
    }));

  it('should enable a user recently created.', () => {
    const name = generateRandomString();
    const password = generateRandomString();
    return user
      .create({ connection, user: { name, password } })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.enable({ connection, username: name, enabled: true });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return user.enabled({ connection, username: name });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body.enabled).toBe(true));
  });
});
