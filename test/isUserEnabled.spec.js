const { user } = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
  ConnectionFactory,
} = require('./setup-database');

describe('user.enabled()', () => {
  let conn;

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  it('should get NOT_FOUND for a non-existent user', () => {
    return user.enabled(conn, 'someuser').then(res => {
      expect(res.status).toEqual(404);
    });
  });

  it("should return the value with the user's enabled flag", () => {
    return user.enabled(conn, 'admin').then(res => {
      expect(res.result.enabled).toEqual(true);
    });
  });

  it("should return the value with the user's superuser flag (false)", () => {
    const username = generateRandomString();
    const password = generateRandomString();

    return user
      .create(conn, {
        username,
        password,
      })
      .then(res => {
        expect(res.status).toEqual(201);
        return user.enable(conn, username, false);
      })
      .then(() => user.enabled(conn, username))
      .then(res => {
        expect(res.result.enabled).toEqual(false);
      });
  });
});
