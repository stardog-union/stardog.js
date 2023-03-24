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

  it('should correctly identify ask queries', () => {
    const query = `# PREFIX : <http://www.example.com>
ASK { ?s ?p ?o }`;
    expect(queryType(query)).toBe('ask');
  });
  it('should correctly identify construct queries', () => {
    const query = `# PREFIX : <http://www.example.com>
CONSTRUCT { ?s ?p ?o }
WHERE { ?s ?p ?o }`;
    expect(queryType(query)).toBe('construct');
  });
  it('should correctly identify describe queries', () => {
    const query = `# PREFIX : <http://www.example.com>
DESCRIBE ?s`;
    expect(queryType(query)).toBe('describe');
  });
  it('should correctly identify validate queries', () => {
    const query = `# PREFIX : <http://www.example.com>
VALIDATE { ?s ?p ?o }
WHERE { ?s ?p ?o }`;
    expect(queryType(query)).toBe('validate');
  });
});
