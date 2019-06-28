import { Connection } from '../lib';
import { Headers, Request } from '../lib/fetch';

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
      c.configure({
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
    it('defaults to creating a Headers object with the Auth header set', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
      });
      const headers = c.headers();
      expect(headers.get('Authorization')).toBe('Basic YWRtaW46YWRtaW4=');
    });

    it('returns the result of `createHeaders` when it is exists', () => {
      const headers = new Headers({ lol: 'lol' });
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
        meta: {
          createHeaders: () => headers,
        },
      });
      expect(c.headers()).toBeInstanceOf(Headers);
      expect(c.headers().get('lol')).toBe('lol');
    });

    it('passes default headers to `createHeaders` for modification', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
        meta: {
          createHeaders: ({ headers }) => {
            expect(headers.get('Authorization')).toBe('Basic YWRtaW46YWRtaW4=');
            headers.set('New-Header', 'headerz');
            headers.set('Authorization', 'Negotiate blahbadyblah');
            return headers;
          },
        },
      });
      const headers = c.headers();
      expect(headers).toBeInstanceOf(Headers);
      expect(headers.get('New-Header')).toBe('headerz');
      expect(headers.get('Authorization')).toBe('Negotiate blahbadyblah');
    });
  });

  describe('request()', () => {
    it('returns the same value as uri() when `createRequest` does not exist', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
      });
      expect(c.request('admin', 'databases', 'foo', 'bar')).toBe(
        c.uri('admin', 'databases', 'foo', 'bar')
      );
    });

    it('returns the result of `createRequest` when it exists', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
        meta: {
          createRequest: () => 'foo',
        },
      });
      expect(c.request('admin', 'databases', 'foo', 'bar')).toBe('foo');
    });

    it('passes the result of `uri()` and a `Request` ctor to `createRequest`', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
      });
      c.meta = {
        createRequest: ({ uri }) => `${uri}foo`,
      };
      expect(c.request('admin', 'databases', 'foo', 'bar')).toBe(
        `${c.uri('admin', 'databases', 'foo', 'bar')}foo`
      );
      c.meta = {
        createRequest: ({ Request }) => new Request('test'),
      };
      const result = c.request('admin', 'databases', 'foo', 'bar');
      expect(result).toBeInstanceOf(Request);
    });

    // safety check only because a previous method was going to do this
    it('does not alter requests for any other Connection objects', () => {
      const c = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
      });
      const c2 = new Connection({
        username: 'admin',
        password: 'admin',
        endpoint: 'http://localhost:5820/DB/',
        meta: {
          createRequest: () => 'foo',
        },
      });
      expect(c2.request('admin', 'databases', 'foo', 'bar')).toBe('foo');
      expect(c.request('admin', 'databases', 'foo', 'bar')).toBe(
        c.uri('admin', 'databases', 'foo', 'bar')
      );
    });
  });
});
