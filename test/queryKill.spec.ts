import { query } from '../lib';
import { ConnectionFactory } from './setup-database';

describe('Kill a running query', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return 404 trying to kill a query with a non-existent queryId', () => {
    const queryId = '1';
    return query.kill({ connection, queryId }).then((res) => {
      expect(res.status).toEqual(404);
    });
  });
});
