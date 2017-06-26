const Stardog = require('../lib');

describe('List Users Test Suite', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  afterEach(() => {
    conn = null;
  });

  it('should return a list of current registered users in the system.', done => {
    conn.listUsers((data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.users).toContain('admin');
      done();
    });
  });
});
