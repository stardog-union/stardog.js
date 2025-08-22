/* eslint-env jest */

const { query } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('queryList()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return the number of global running queries', () =>
    query.list(conn).then((res) => {
      expect(res.status).toEqual(200);
      expect(res.body.queries).toHaveLength(0);
    }));
});
