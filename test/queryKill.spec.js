const Stardog = require('../lib');

describe('Kill a running query', () => {
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

  it('should return 404 trying to kill a query with a non-existent queryId', done => {
    var queryId = '1';

    conn.queryKill(
      {
        queryId: queryId,
      },
      (data, response) => {
        expect(data).toContain('Query not found: ' + queryId);
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });
});
