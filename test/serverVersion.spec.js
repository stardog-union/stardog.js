/* eslint-env jest */

const { server } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('server.version()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('resolves to the promise value, when given', () =>
    server.version('foo', null).then(res => {
      expect(res).toBe('foo');
    }));
  it('gets version from server when known version is not given', () =>
    server.version(null, conn).then(res => {
      expect(typeof res).toBe('string');
    }));
  it('returns null when given neither the current version nor a connection to get one', () =>
    expect(server.version(null, null)).toBe(null));
});
