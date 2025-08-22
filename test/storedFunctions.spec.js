/* eslint-env jest */

const storedFunctions = require('../lib/storedFunctions');

const { ConnectionFactory } = require('./setup-database');

describe('storedFunctions', () => {
  const conn = ConnectionFactory();
  const functions = `prefix ex: <http://example/>
  function ex:permutation(?n, ?r) { factorial(?n) / factorial(?n - ?r) }
  function <http://example/combination>(?n, ?r) { permutation(?n, ?r) / factorial(?r) }`;
  const func1 = 'http://example/permutation';
  const func2 = 'http://example/combination';

  // test add once and ensure functions are there for all tests
  beforeAll(() =>
    storedFunctions.add(conn, functions).then((res) => {
      expect(res.status).toBe(204);
    })
  );

  // test clear once
  afterAll(() =>
    storedFunctions.clear(conn).then((res) => {
      expect(res.status).toBe(204);
    })
  );

  it('getAll', () =>
    storedFunctions.getAll(conn).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toContain(func1);
      expect(res.body).toContain(func2);
    }));

  it('get', () =>
    storedFunctions.get(conn, func1).then((res) => {
      expect(res.status).toBe(200);
      expect(res.body).toContain(func1);
    }));

  it('remove', () =>
    storedFunctions
      .remove(conn, func1)
      .then((res) => {
        expect(res.status).toBe(204);
        return storedFunctions.getAll(conn);
      })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).not.toContain(func1);
        expect(res.body).toContain(func2);
      }));
});
