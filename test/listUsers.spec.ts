import { user } from '../lib';
import { ConnectionFactory } from './setup-database';

describe('List Users Test Suite', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return a list of current registered users in the system.', () =>
    user
      .list({ connection })
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((body) => expect(body.users).toContain('admin')));
});
