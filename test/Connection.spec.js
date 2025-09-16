/* eslint-env jest */

const { Connection } = require('../lib');

const host = process.env.HOST || 'localhost';

describe('Stardog.Connection', () => {
  it('creates a new connection object', () => {
    const c = new Connection();
    expect(c).toBeInstanceOf(Connection);
  });

  it('creates a new connection object with options', () => {
    const c = new Connection({
      username: 'admin',
      password: 'admin',
      endpoint: `http://${host}:5820/DB/`,
    });
    expect(c).toMatchObject({
      username: 'admin',
      password: 'admin',
      endpoint: `http://${host}:5820/DB`,
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
        endpoint: `http://${host}:3000/DB`,
      });
      expect(c).toMatchObject({
        username: 'adam',
        password: 'admin',
        endpoint: `http://${host}:3000/DB`,
      });
    });
  });

  describe('uri()', () => {
    it('returns a formatted uri', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: `http://${host}:5820/DB/`,
      });
      expect(c.uri('admin', 'databases', 'foo', 'bar')).toBe(
        `http://${host}:5820/DB/admin/databases/foo/bar`
      );
    });
  });

  describe('headers()', () => {
    it('defaults to creating a Headers object with the Auth header set', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: `http://${host}:5820/DB/`,
      });
      const headers = c.headers();
      expect(headers.get('Authorization')).toBe('Basic YWRtaW46YWRtaW4=');
    });

    it('uses the token for authorization if specified', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        token: 'some-valid-token-goes-here',
        endpoint: `http://${host}:5280/`,
      });
      const headers = c.headers();
      expect(headers.get('Authorization')).toBe(
        'bearer some-valid-token-goes-here'
      );
    });

    it('returns the result of `createHeaders` when it is exists', () => {
      const c = new Connection(
        {
          username: 'admin',
          password: 'admin',
          endpoint: `http://${host}:5820/DB/`,
        },
        {
          createHeaders: () => 'lol',
        }
      );
      expect(c.headers()).toBe('lol');
    });

    it('passes default headers to `createHeaders` for modification', () => {
      const c = new Connection(
        {
          username: 'admin',
          password: 'admin',
          endpoint: `http://${host}:5820/DB/`,
        },
        {
          createHeaders: ({ headers }) => {
            expect(headers.get('Authorization')).toBe('Basic YWRtaW46YWRtaW4=');
            headers.set('New-Header', 'headerz');
            headers.set('Authorization', 'Negotiate blahbadyblah');
            return headers;
          },
        }
      );
      const headers = c.headers();
      expect(headers.get('New-Header')).toBe('headerz');
      expect(headers.get('Authorization')).toBe('Negotiate blahbadyblah');
    });
  });

  describe('request()', () => {
    it('returns the same value as uri() when `createRequest` does not exist', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: `http://${host}:5820/DB/`,
      });
      expect(c.request('admin', 'databases', 'foo', 'bar')).toBe(
        c.uri('admin', 'databases', 'foo', 'bar')
      );
    });

    it('returns the result of `createRequest` when it exists', () => {
      const c = new Connection(
        {
          username: 'admin',
          password: 'admin',
          endpoint: `http://${host}:5820/DB/`,
        },
        {
          createRequest: () => 'foo',
        }
      );
      expect(c.request('admin', 'databases', 'foo', 'bar')).toBe('foo');
    });

    it('passes the result of `uri()` and a `Request` ctor to `createRequest`', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: `http://${host}:5820/DB/`,
      });
      c.meta = {
        createRequest: ({ uri }) => `${uri}foo`,
      };
      expect(c.request('admin', 'databases', 'foo', 'bar')).toBe(
        `${c.uri('admin', 'databases', 'foo', 'bar')}foo`
      );
      c.meta = {
        createRequest: ({ Request }) => Request,
      };
      const Result = c.request('admin', 'databases', 'foo', 'bar');
      expect(typeof Result).toBe('function');
      expect(Result.name).toBe('Request');
      expect(new Result(c.uri('admin', 'databases', 'foo', 'bar')).method).toBe(
        'GET'
      );
    });

    // safety check only because a previous method was going to do this
    it('does not alter requests for any other Connection objects', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: `http://${host}:5820/DB/`,
      });
      const c2 = new Connection(
        {
          username: 'admin',
          password: 'admin',
          endpoint: `http://${host}:5820/DB/`,
        },
        {
          createRequest: () => 'foo',
        }
      );
      expect(c2.request('admin', 'databases', 'foo', 'bar')).toBe('foo');
      expect(c.request('admin', 'databases', 'foo', 'bar')).toBe(
        c.uri('admin', 'databases', 'foo', 'bar')
      );
    });
  });
});
