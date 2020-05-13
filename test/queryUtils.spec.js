/* eslint-env jest */

const { queryType } = require('../lib/query/utils');

// TODO: More tests of this utility
describe('queryType', () => {
  // Test for issue #228
  it('should correctly identify queries with commented-out prefixes', () => {
    const query = `# PREFIX : <http://www.example.com>
SELECT * { ?s ?p ?o }`;
    expect(queryType(query)).toBe('select');
  });
});
