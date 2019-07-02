import { user } from '../lib';
import { generateRandomString, ConnectionFactory } from './setup-database';

describe('user.enabled()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should get NOT_FOUND for a non-existent user', () =>
    user.enabled({ connection, username: 'someuser' }).then((res) => {
      expect(res.status).toEqual(404);
    }));

  it("should return the value with the user's enabled flag", () =>
    user
      .enabled({ connection, username: 'admin' })
      .then((res) => res.json())
      .then((body) => expect(body.enabled).toEqual(true)));

  it("should return the value with the user's superuser flag (false)", () => {
    const name = generateRandomString();
    const password = generateRandomString();

    return user
      .create({
        connection,
        user: {
          name,
          password,
        },
      })
      .then((res) => {
        expect(res.status).toEqual(201);
        return user.enable({ connection, username: name, enabled: false });
      })
      .then(() => user.enabled({ connection, username: name }))
      .then((res) => res.json())
      .then((body) => expect(body.enabled).toEqual(false));
  });
});
