/* eslint-env jest */

const { user: { role } } = require('../lib');
const { ConnectionFactory, generateRandomString } = require('./setup-database');

describe('listRoles()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return a list of current registered roles in the system.', () => {
    const rolename = generateRandomString();
    return role
      .create(conn, { name: rolename })
      .then(() => role.list(conn))
      .then(res => {
        expect(res.status).toEqual(200);
        expect(res.body.roles).toContain('reader', rolename);
      });
  });
});
