import { user } from '../lib';
import { ConnectionFactory } from './setup-database';

describe('user.get', () => {
  const connection = ConnectionFactory();

  it('should return information on a given user', () =>
    user
      .get({ connection, username: 'admin' })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.json();
      })
      .then((body) =>
        expect(body).toEqual({
          enabled: true,
          permissions: expect.any(Array),
          roles: expect.any(Array),
          superuser: true,
        })
      ));
});
