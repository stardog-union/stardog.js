/* eslint-env jest */

const { query } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('queryGet()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return 404 trying to get a queryInfo of a non-existent queryId', () => {
    const queryId = '1';
    query.get(conn, queryId).then(res => {
      expect(res.result.message).toEqual(`Query not found: ${queryId}`);
      expect(res.status).toEqual(404);
    });
  });
});
