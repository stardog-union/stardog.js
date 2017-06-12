const Stardog = require('../lib');

describe('Testing connection without trailing /', () => {
  var conn;

  afterEach(() => {
    conn = null;
  });

  it('should execute command successfully using endpoint with trailing /', done => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');

    conn.listUsers((data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.users).toContain('admin');
      done();
    });
  });

  it('should execute command successfully using endpoint without trailing /', done => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820');
    conn.setCredentials('admin', 'admin');

    conn.listUsers((data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.users).toContain('admin');
      done();
    });
  });

  it('should execute command successfully using endpoint with two trailing /', done => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820//');
    conn.setCredentials('admin', 'admin');

    conn.listUsers((data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.users).toContain('admin');
      done();
    });
  });
});
