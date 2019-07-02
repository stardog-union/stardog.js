import { query } from '../lib';
import { ConnectionFactory } from './setup-database';

describe('queryGet()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return 404 trying to get a queryInfo of a non-existent queryId', () => {
    const queryId = '1';
    query
      .get({ connection, queryId })
      .then((res) => {
        expect(res.status).toEqual(404);
        return res.json();
      })
      .then((body) => {
        expect(body.message).toEqual(`Query not found: ${queryId}`);
      });
  });
});
