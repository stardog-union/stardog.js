const Stardog = require('../lib');

describe('queryList()', () => {
  var conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
    conn.setReasoning(true);
  });

  afterEach(() => {
    conn = null;
  });

  it('should start a query and list it with the listQueries call.', done => {
    conn.queryList((data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.queries).toHaveLength(0);
      done();
    });
  });
});
