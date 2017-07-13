/* eslint-env jest */

const { icv } = require('../lib');
const {
  seedICVDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
  icvAxioms,
} = require('./setup-database');

describe('set integrity constraint', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();

  beforeAll(seedICVDatabase(database));
  afterAll(dropDatabase(database));

  it('should store integrity constraint axioms for a database', () => {
    icv
      .convert(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => {
        expect(res.result.startsWith('SELECT')).toBeTruthy();
      });
  });
});
