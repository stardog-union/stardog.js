const Stardog = require('../lib');

describe('dropDB()', () => {
  let conn;

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should not drop an non-existent DB', done => {
    conn.dropDB({ database: 'nodeDBDrop' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      expect(data.message).toEqual("Database 'nodeDBDrop' does not exist.");
      done();
    });
  });
});
