/* eslint-env jest */

const { server } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('server.properties()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should retrieve a JS object containing server properties', () =>
    server.properties(conn).then(res => {
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      const bodyKeys = Object.keys(res.body);
      expect(bodyKeys.length).toBeGreaterThan(0);
    }));

  it('should only include the specified properties when names param is set', () =>
    server.properties(conn, ['query.timeout', 'jwt.conf']).then(res => {
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');

      // Url should have correct querystring. Don't test the output of the
      // response body because it's up to the Stardog api to get that right.
      // And we don't know which properties will already be set.
      expect(res.url).toBe(
        `${conn.endpoint}/admin/properties?name=query.timeout&name=jwt.conf`
      );
    }));
});
