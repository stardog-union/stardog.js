var stardog = require('../js/stardog');
var qs = require('querystring');

describe ("Testing connection without trailing /", function() {
  var conn;

  afterEach(function() {
    conn = null;
  });


  it ("should execute command successfully using endpoint with trailing /", function (done) {
    conn = new stardog.Connection();
    conn.setEndpoint("http://localhost:5822/");
    conn.setCredentials("admin", "admin");

    conn.listUsers(function (data, response) {
      expect(response.statusCode).toBe(200);

      expect(data.users).toBeDefined();
      expect(data.users).not.toBeNull();
      expect(data.users.length).toBeGreaterThan(0);
      expect(data.users).toContain('admin');

      done();
    });
  });

  it ("should execute command successfully using endpoint without trailing /", function (done) {
    conn = new stardog.Connection();
    conn.setEndpoint("http://localhost:5822");
    conn.setCredentials("admin", "admin");

    conn.listUsers(function (data, response) {
      expect(response.statusCode).toBe(200);

      expect(data.users).toBeDefined();
      expect(data.users).not.toBeNull();
      expect(data.users.length).toBeGreaterThan(0);
      expect(data.users).toContain('admin');

      done();
    });
  });

  it ("should execute command successfully using endpoint with two trailing /", function (done) {
    conn = new stardog.Connection();
    conn.setEndpoint("http://localhost:5822//");
    conn.setCredentials("admin", "admin");

    conn.listUsers(function (data, response) {
      expect(response.statusCode).toBe(200);

      expect(data.users).toBeDefined();
      expect(data.users).not.toBeNull();
      expect(data.users.length).toBeGreaterThan(0);
      expect(data.users).toContain('admin');

      done();
    });
  });
});