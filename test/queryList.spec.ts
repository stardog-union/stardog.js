import { query } from '../lib';
import { ConnectionFactory } from './setup-database';

describe('queryList()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it.skip('should return the number of global running queries', () =>
    query
      .list({ connection })
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((body) => expect(body.queries).toHaveLength(0)));
});
