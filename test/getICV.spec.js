/* eslint-env jest */

const fs = require('fs');
const path = require('path');
const { icv } = require('../lib');
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

  it('should return an empty string if no constraint axioms stored', () => {
    icv.get(conn, database).then(res => {
      expect(res.status).toBe(200);
      expect(res.result.length).toBe(0);
    });
  });

  it('should return stored constraint axioms for a database', () =>
    icv
      .set(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => expect(res.status).toBe(204))
      .then(() => icv.get(conn, database))
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result.length).toBeGreaterThan(0);
        expect(res.result.includes('<http://example.org/issues#Issue>')).toBe(
          true
        );
      }));
});
