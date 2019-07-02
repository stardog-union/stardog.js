import { user, role } from '../lib';
import { generateRandomString, ConnectionFactory } from './setup-database';

describe('listUserRoles()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return NOT_FOUND if trying to list roles from non-existent user', () =>
    user
      .listRoles({ connection, username: generateRandomString() })
      .then((res) => {
        expect(res.status).toBe(404);
      }));

  it('should return a non-empty list with the roles of the user', () => {
    const r = generateRandomString();
    return role
      .create({
        connection,
        role: {
          name: r,
        },
      })
      .then(() =>
        user.setRoles({ connection, username: 'anonymous', roles: [r] })
      )
      .then(() => user.listRoles({ connection, username: 'anonymous' }))
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) => expect(body.roles).toContain(r));
  });
});
