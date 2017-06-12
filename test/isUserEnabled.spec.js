const Stardog = require('../lib');

describe('isUserEnabled()', () => {
  var conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should get NOT_FOUND for a non-existent user', done => {
    conn.isUserEnabled({ user: 'someuser' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it("should return the value with the user's enabled flag", done => {
    conn.isUserEnabled({ user: 'admin' }, (data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.enabled).toEqual(true);
      done();
    });
  });
});
