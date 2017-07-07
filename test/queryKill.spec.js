const { query } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('Kill a running query', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return 404 trying to kill a query with a non-existent queryId', () => {
    const queryId = '1';
    return query.kill(conn, queryId).then(res => {
      expect(res.status).toEqual(404);
    });
  });
});
