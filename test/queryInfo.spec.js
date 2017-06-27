const Stardog = require('../lib');

describe('queryGet()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
    conn.setReasoning(true);
  });

  it('should return 404 trying to get a queryInfo of a non-existent queryId', done => {
    const queryId = '1';

    conn.queryGet(
      {
        queryId: queryId,
      },
      (data, response) => {
        expect(data.message).toEqual(`Query not found: ${queryId}`);
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });
});
