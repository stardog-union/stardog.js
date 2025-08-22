/* eslint-env jest */

const { server } = require('../lib');
const { ConnectionFactory } = require('./setup-database');

describe('server.logs()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should retrieve a JS response object containing the logs zip file', () =>
    server.logs(conn).then((response) => {
      expect(response.status).toBe(200);

      return response.arrayBuffer().then((buffer) => {
        expect(buffer).toBeTruthy();
        expect(buffer.byteLength).toBeGreaterThan(0);
      });
    }));
});
