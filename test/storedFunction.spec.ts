import { storedFunction } from '../lib';
import { ConnectionFactory } from './setup-database';

describe('storedFunction', () => {
  const connection = ConnectionFactory();
  const functions = `prefix ex: <http://example/>
  function ex:permutation(?n, ?r) { factorial(?n) / factorial(?n - ?r) }
  function <http://example/combination>(?n, ?r) { permutation(?n, ?r) / factorial(?r) }`;
  const func1 = 'http://example/permutation';
  const func2 = 'http://example/combination';

  // test add once and ensure functions are there for all tests
  beforeAll(() =>
    storedFunction.add({ connection, functions }).then((res) => {
      expect(res.status).toBe(204);
    })
  );

  // test clear once
  afterAll(() =>
    storedFunction.clear({ connection }).then((res) => {
      expect(res.status).toBe(204);
    })
  );

  it('getAll', () =>
    storedFunction
      .getAll({ connection })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => {
        expect(text).toContain(func1);
        expect(text).toContain(func2);
      }));

  it('get', () =>
    storedFunction
      .get({ connection, name: func1 })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => expect(text).toContain(func1)));

  it('remove', () =>
    storedFunction
      .remove({ connection, name: func1 })
      .then((res) => {
        expect(res.status).toBe(204);
        return storedFunction.getAll({ connection });
      })
      .then((res) => {
        expect(res.status).toBe(200);
        return res.text();
      })
      .then((text) => {
        expect(text).not.toContain(func1);
        expect(text).toContain(func2);
      }));
});
