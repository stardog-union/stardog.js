import { role } from '../lib';
import { ConnectionFactory, generateRandomString } from './setup-database';

describe('listRoles()', () => {
  let connection;

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return a list of current registered roles in the system.', () => {
    const rolename = generateRandomString();
    return role
      .create({ connection, role: { name: rolename } })
      .then(() => role.list({ connection }))
      .then((res) => {
        expect(res.status).toEqual(200);
        return res.json();
      })
      .then((body) => {
        expect(body.roles).toContain('reader');
        expect(body.roles).toContain(rolename);
      });
  });
});
