/* eslint-env jest */

const { encodeQueryString } = require('../lib/utils');

// The helper itself; the URLs it is used to build are asserted in
// `dataSources.spec.js`.
describe('encodeQueryString', () => {
  it('produces no query string when no params are given', () => {
    expect(encodeQueryString({})).toBe('');
  });

  it('serializes a search term and a limit together', () => {
    expect(encodeQueryString({ search: 'cust', limit: 1000 })).toBe(
      '?search=cust&limit=1000'
    );
  });

  it('uri-encodes search terms containing spaces and separators', () => {
    expect(encodeQueryString({ search: 'a b&c' })).toBe('?search=a%20b%26c');
  });
});
