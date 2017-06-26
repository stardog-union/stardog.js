const Stardog = require('../lib');

describe('queryList()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
    conn.setReasoning(true);
  });

  it('should return the number of global running queries', done => {
    conn.queryList((data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.queries).toHaveLength(0);
      done();
    });
  });
});
