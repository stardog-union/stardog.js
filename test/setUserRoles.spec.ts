import { user } from '../lib';
import { generateRandomString, ConnectionFactory } from './setup-database';

describe('Set User Roles Test Suite', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to set roles to a non-existent user.', () =>
    user
      .setRoles({
        connection,
        username: generateRandomString(),
        roles: ['reader'],
      })
      .then((res) => {
        expect(res.status).toBe(404);
      }));

  it('should assign roles to a newly created user.', () => {
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
      .then(() =>
        user.setRoles({ connection, username: name, roles: ['reader'] })
      )
      .then((res) => {
        expect(res.status).toBe(200);
        return user.listRoles({ connection, username: name });
      })
      .then((res) => res.json())
      .then((body) => expect(body.roles).toContain('reader'));
  });
});
