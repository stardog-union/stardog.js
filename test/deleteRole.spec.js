const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('deleteRole()', () => {
  const database = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should return NOT_FOUND trying to delete a non-existent role.', done => {
    conn.deleteRole({ role: 'no-writer' }, (data, response) => {
      expect(response.statusCode).toEqual(404);
      done();
    });
  });

  it("should delete a 'writer' role recently created.", done => {
    conn.createRole({ rolename: 'writer' }, (data, res) => {
      // It should be 201 (CREATED)
      expect(res.statusCode).toEqual(201);

      // Once created then lets delete it.
      conn.deleteRole({ role: 'writer' }, (data, res) => {
        expect(res.statusCode).toEqual(204);
        done();
      });
    });
  });
});
