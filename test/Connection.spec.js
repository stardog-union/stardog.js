const { Connection } = require('../lib/index2');

describe('Stardog.Connection', () => {
  it('creates a new connection object', () => {
    const c = new Connection();
    expect(c).toBeInstanceOf(Connection);
  });

  it('creates a new connection object with options', () => {
    const c = new Connection({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820/DB/',
    });
    expect(c).toMatchObject({
      username: 'admin',
      password: 'admin',
      endpoint: 'http://localhost:5820/DB',
    });
  });

  describe('config()', () => {
    it('overwrites existing config options', () => {
      const c = new Connection({
        username: 'admin',
        password: 'foo',
      });
      expect(c).toMatchObject({
        username: 'admin',
        password: 'foo',
        endpoint: undefined,
      });
      c.config({
        username: 'adam',
        password: 'admin',
        endpoint: 'http://localhost:3000/DB',
      });
      expect(c).toMatchObject({
        username: 'adam',
        password: 'admin',
        endpoint: 'http://localhost:3000/DB',
      });
    });
  });

  describe('uri()', () => {
    it('returns a formatted uri', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
      });
      expect(c.uri('admin', 'databases', 'foo', 'bar')).toBe(
        'http://localhost:5820/DB/admin/databases/foo/bar'
      );
    });
  });

  describe('headers()', () => {
    it('creates a Headers object with the Auth header set', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
      });
      const headers = c.headers();
      expect(headers.get('Authorization')).toBe('Basic YWRtaW46YWRtaW4=');
    });
  });
});
