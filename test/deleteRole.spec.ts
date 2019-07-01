import { role } from '../lib';
import {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} from './setup-database';

describe('deleteRole()', () => {
  const database = generateDatabaseName();
  let connection;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    connection = ConnectionFactory();
  });

  it('should return NOT_FOUND trying to delete a non-existent role.', () =>
    role.deleteRole({ connection, role: { name: 'no-writer' } }).then((res) => {
      expect(res.status).toEqual(404);
    }));

  it("should delete a 'writer' role recently created.", () => {
    const rolename = generateRandomString();
    return role
      .create({ connection, role: { name: rolename } })
      .then((res) => {
        expect(res.status).toBe(201);
        return role.deleteRole({ connection, role: { name: rolename } });
      })
      .then((res) => {
        expect(res.status).toEqual(204);
      });
  });
});
