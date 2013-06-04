(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(require('../../js/stardog.js'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['stardog'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.Stardog);
    }
}(this, function (Stardog) {

  describe ("Testing connection without trailing /", function() {
    var conn;

    afterEach(function() {
      conn = null;
    });

    it ("should execute command successfully using endpoint with trailing /", function (done) {
      conn = new Stardog.Connection();
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
      conn = new Stardog.Connection();
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
      conn = new Stardog.Connection();
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

  // Just return a value to define the module export.
  return {};
}));
