/* eslint-env jest */

const { user: { role } } = require('../lib');
const {
  ConnectionFactory,
  generateRandomString,
  generateDatabaseName,
} = require('./setup-database');

describe('role.listInfo()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return a list of current registered roles along with role details.', () => {
    const rolenameA = generateRandomString();
    const rolenameB = generateRandomString();
    const database = generateDatabaseName();
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return role
      .create(conn, { name: rolenameA })
      .then(() => role.create(conn, { name: rolenameB }))
      .then(() => role.assignPermission(conn, rolenameA, permission))
      .then(() => role.listInfo(conn))
      .then(res => {
        expect(res.status).toEqual(200);
        expect(
          res.body.roles.some(
            r => r.rolename === rolenameA && r.permissions.length === 1
          )
        ).toBeTruthy();
        expect(
          res.body.roles.some(
            r => r.rolename === rolenameB && r.permissions.length === 0
          )
        ).toBeTruthy();
      });
  });
});
