/* eslint-env jest */

const { icv } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
  icvAxioms,
} = require('./setup-database');

describe('get integrity constraints', () => {
  const database = generateDatabaseName();
  const conn = ConnectionFactory();

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  it('should return an empty string if no results', () => {
    icv.get(conn, database).then(res => {
      expect(res.status).toBe(200);
      expect(res.result.length).toBe(0);
    });
  });

  it('should return stored integrity constraint axioms for a database', () => {
    icv
      .set(conn, database, icvAxioms, { contentType: 'text/turtle' })
      .then(res => expect(res.status).toBe(204))
      .then(() => icv.get(conn, database))
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.result.length).toBeGreaterThan(0);
        expect(
          res.result.includes('<http://example.org/issues#Issue>')
        ).toBeTruthy();
      });
  });
});
