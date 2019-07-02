import { user } from '../lib';
import { generateRandomString, ConnectionFactory } from './setup-database';

describe('isSuperUser()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should get NOT_FOUND for a non-existent user', () =>
    user.superUser({ connection, username: 'someuser' }).then((res) => {
      expect(res.status).toBe(404);
    }));

  it("should return the value with the user's superuser flag (true)", () =>
    user
      .superUser({ connection, username: 'admin' })
      .then((res) => res.json())
      .then((body) => expect(body.superuser).toBe(true)));

  it("should return the value with the user's superuser flag (false)", () => {
    const name = generateRandomString();
    const password = generateRandomString();

    return user
      .create({
        connection,
        user: {
          name,
          password,
          superuser: false,
        },
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.superUser({ connection, username: name });
      })
      .then((res) => res.json())
      .then((body) => expect(body.superuser).toBe(false));
  });
});
