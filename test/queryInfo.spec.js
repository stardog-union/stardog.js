const { Connection, query } = require('../lib/index2');

describe('queryGet()', () => {
  let conn;

  beforeEach(() => {
    conn = new Connection({
      endpoint: 'http://localhost:5820/',
      username: 'admin',
      password: 'admin',
    });
  });

  it('should return 404 trying to get a queryInfo of a non-existent queryId', () => {
    const queryId = '1';
    query.get(conn, queryId).then(res => {
      expect(res.result.message).toEqual(`Query not found: ${queryId}`);
      expect(res.status).toEqual(404);
    });
  });
});
