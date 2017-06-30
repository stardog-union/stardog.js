const { Connection, query } = require('../lib/index2');

describe('Kill a running query', () => {
  let conn;

  beforeEach(() => {
    conn = new Connection({
      endpoint: 'http://localhost:5820/',
      username: 'admin',
      password: 'admin',
    });
  });

  it('should return 404 trying to kill a query with a non-existent queryId', () => {
    const queryId = '1';
    return query.kill(conn, queryId).then(res => {
      expect(res.status).toEqual(404);
    });
  });
});
