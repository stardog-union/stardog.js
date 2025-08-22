/* eslint-env jest */

const { user } = require('../lib');
const { generateRandomString, ConnectionFactory } = require('./setup-database');

const { role } = user;

describe('user.get', () => {
  const conn = ConnectionFactory();

  it('should return information on a given user', () => {
    const r = generateRandomString();
    const permission = {
      action: 'READ',
      resource_type: 'named-graph',
      resource: ['resource_name', 'http://graphurl.com'],
    };

    return role
      .create(conn, {
        name: r,
      })
      .then(() => user.setRoles(conn, 'anonymous', [r]))
      .then(() => user.assignPermission(conn, r, permission))
      .then(() => user.get(conn, 'admin'))
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
          enabled: true,
          permissions: expect.any(Array),
          roles: expect.any(Array),
          superuser: true,
        });
      });
  });
});
