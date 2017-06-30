const { Connection, query } = require('../lib/index2');

describe('queryList()', () => {
  let conn;

  beforeEach(() => {
    conn = new Connection({
      endpoint: 'http://localhost:5820/',
      username: 'admin',
      password: 'admin',
    });
  });

  it('should return the number of global running queries', () => {
    return query.list(conn).then(res => {
      expect(res.status).toEqual(200);
      expect(res.result.queries).toHaveLength(0);
    });
  });
});
