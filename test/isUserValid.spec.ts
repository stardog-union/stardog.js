import { user, Connection } from '../lib';
import { ConnectionFactory } from './setup-database';

describe('user.get', () => {
  let connection: Connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return 200 if a Connection has valid creds', () =>
    user.valid({ connection }).then((res) => {
      expect(res.status).toBe(200);
    }));

  it('should return 401 for invalid creds', () => {
    connection.configure({ password: 'bad' });
    return user.valid({ connection }).then((res) => {
      expect(res.status).toBe(401);
    });
  });
});
