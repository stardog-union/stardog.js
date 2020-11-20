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
    }));

  it('should be able to request for a specific property with its name', () =>
    server.properties(conn, { name: 'security.realms' }).then(res => {
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
    }));
});
