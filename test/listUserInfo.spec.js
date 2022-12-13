/* eslint-env jest */

const { user } = require('../lib');
const {
  ConnectionFactory,
  generateRandomString,
  generateDatabaseName,
} = require('./setup-database');

describe('user.listInfo()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return a list of current registered user along with user details.', () => {
    const usernameA = generateRandomString();
    const usernameB = generateRandomString();
    const database = generateDatabaseName();
    const permission = {
      action: 'write',
      resourceType: 'db',
      resources: [database],
    };

    return user
      .create(conn, { name: usernameA, password: 'password', superuser: true })
      .then(() => user.create(conn, { name: usernameB, password: 'password' }))
      .then(() => user.assignPermission(conn, usernameA, permission))
      .then(() => user.listInfo(conn))
      .then(res => {
        expect(res.status).toEqual(200);
        expect(
          res.body.users.some(
            u =>
              u.username === usernameA &&
              u.superuser &&
              u.permissions.length === 4
          )
        ).toBeTruthy();
        expect(
          res.body.users.some(
            u =>
              u.username === usernameB &&
              !u.superuser &&
              u.permissions.length === 2
          )
        ).toBeTruthy();
      });
  });
});
