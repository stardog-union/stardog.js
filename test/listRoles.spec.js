const Stardog = require('../lib');

describe('listRoles()', () => {
  var conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  afterEach(() => {
    conn = null;
  });

  it('should return a list of current registered roles in the system.', done => {
    conn.listRoles((data, response) => {
      expect(response.statusCode).toEqual(200);
      expect(data.roles).toContain('reader');
      done();
    });
  });
});
