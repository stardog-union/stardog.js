import { server } from '../lib';
import { ConnectionFactory } from './setup-database';

describe('server.status()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should retrieve a JS object containing server status information', () =>
    server
      .status({ connection })
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toBe('application/json');
        return res.json();
      })
      .then((body) => {
        // Minimal checks for the right type of data:
        const bodyKeys = Object.keys(body);
        expect(bodyKeys.some((key) => key.startsWith('system.'))).toBe(true);
        expect(bodyKeys.some((key) => key.startsWith('dbms.'))).toBe(true);
      }));

  it('should exclude database info only when database param is false', () =>
    Promise.all([
      server.status({ connection }).then((res) => res.json()),
      server
        .status({ connection, params: { databases: true } })
        .then((res) => res.json()),
      server
        .status({ connection, params: { databases: false } })
        .then((res) => res.json()),
    ]).then((res) => {
      const [noParamRes, trueParamRes, falseParamRes] = res;
      const noParamResBodyKeys = Object.keys(noParamRes);
      const falseParamResBodyKeys = Object.keys(falseParamRes);
      expect(noParamResBodyKeys.length).toBe(Object.keys(trueParamRes).length);
      expect(
        noParamResBodyKeys.some((key) => key.startsWith('databases.'))
      ).toBe(true);
      expect(noParamResBodyKeys.length).toBeGreaterThan(
        falseParamResBodyKeys.length
      );
      expect(
        falseParamResBodyKeys.some((key) => key.startsWith('databases.'))
      ).toBe(false);
    }));
});
