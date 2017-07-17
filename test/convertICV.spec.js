/* eslint-env jest */

const fs = require('fs');
const path = require('path');
const { db: { icv } } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

const icvAxioms = fs.readFileSync(
  path.resolve(`${__dirname}/fixtures/issues/constraints.ttl`),
  'utf8'
);

describe('icv', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('should convert constraint axioms to a SPARQL query', () =>
    icv
      .convert(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => {
        expect(res.body.startsWith('SELECT')).toBe(true);
      }));
});
