const { query } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('queryList()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it.skip('should return the number of global running queries', () => {
    return query.list(conn).then(res => {
      expect(res.status).toEqual(200);
      expect(res.result.queries).toHaveLength(0);
    });
  });
});
