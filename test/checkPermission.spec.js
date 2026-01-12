/* eslint-env jest */

const { user, Connection } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('checkPermission()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should return true for a permission the admin user has', () =>
    user.checkPermission(conn, 'READ', 'db', database).then(res => {
      expect(res.status).toBe(200);
      expect(res.body.hasPermission).toBe(true);
    }));

  it('should return false for a permission a new user does not have', () => {
    const username = generateRandomString();
    const password = generateRandomString();

    return user
      .create(conn, { username, password })
      .then(res => {
        expect(res.status).toBe(201);
        // Create a new connection for the unprivileged user
        const userConn = new Connection({
          username,
          password,
          endpoint: conn.uri(),
        });
        return user.checkPermission(userConn, 'WRITE', 'db', database);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.hasPermission).toBe(false);
      });
  });

  it('should return true after assigning a permission to a user', () => {
    const username = generateRandomString();
    const password = generateRandomString();
    const userConn = new Connection({
      username,
      password,
      endpoint: conn.uri(),
    });
    const permission = {
      action: 'WRITE',
      resourceType: 'db',
      resources: [database],
    };

    return user
      .create(conn, { username, password })
      .then(res => {
        expect(res.status).toBe(201);
        // First verify the user does not have the permission
        return user.checkPermission(userConn, 'WRITE', 'db', database);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.hasPermission).toBe(false);
        // Now assign the permission
        return user.assignPermission(conn, username, permission);
      })
      .then(res => {
        expect(res.status).toBe(201);
        // Verify the user now has the permission
        return user.checkPermission(userConn, 'WRITE', 'db', database);
      })
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.hasPermission).toBe(true);
      });
  });
});
