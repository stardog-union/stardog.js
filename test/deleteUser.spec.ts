import { user } from '../lib';
import { generateRandomString, ConnectionFactory } from './setup-database';

describe('deleteUser()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to delete a non-existent user.', () =>
    user
      .deleteUser({ connection, username: generateRandomString() })
      .then((res) => {
        expect(res.status).toBe(404);
      }));

  it('should delete a supplied user recently created.', () => {
    const name = generateRandomString();
    return user
      .create({
        connection,
        user: {
          name,
          password: generateRandomString(),
        },
      })
      .then((res) => {
        expect(res.status).toBe(201);
        return user.deleteUser({ connection, username: name });
      })
      .then((res) => {
        expect(res.status).toBe(204);
      });
  });
});
