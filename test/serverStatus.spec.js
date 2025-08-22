/* eslint-env jest */

const { server } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('server.status()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should retrieve a JS object containing server status information', () =>
    server.status(conn).then(res => {
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('application/json');
      // Minimal checks for the right type of data:
      const bodyKeys = Object.keys(res.body);
      expect(bodyKeys.some(key => key.startsWith('system.'))).toBe(true);
      expect(bodyKeys.some(key => key.startsWith('dbms.'))).toBe(true);
    }));

  it('should exclude database info only when database param is false', () =>
    Promise.all([
      server.status(conn),
      server.status(conn, { databases: true }),
      server.status(conn, { databases: false }),
    ]).then(res => {
      const [noParamRes, trueParamRes, falseParamRes] = res;
      const noParamResBodyKeys = Object.keys(noParamRes.body);
      const falseParamResBodyKeys = Object.keys(falseParamRes.body);
      expect(noParamResBodyKeys.length).toBe(
        Object.keys(trueParamRes.body).length
      );
      expect(noParamResBodyKeys.some(key => key.startsWith('databases.'))).toBe(
        true
      );
      expect(noParamResBodyKeys.length).toBeGreaterThan(
        falseParamResBodyKeys.length
      );
      expect(
        falseParamResBodyKeys.some(key => key.startsWith('databases.'))
      ).toBe(false);
    }));
});
