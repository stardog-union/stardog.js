const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('setDBOptions()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should get NOT_FOUND status code trying to set the options of a non-existent DB.', done => {
    conn.setDBOptions(
      { database: 'nodeDB_test', optionsObj: {} },
      (data, response) => {
        expect(response.statusCode).toEqual(404);
        done();
      }
    );
  });

  it('should set the options of an DB', done => {
    var optionsObj = {
      'search.enabled': true,
      'icv.enabled': false,
    };

    conn.offlineDB({ database, strategy: 'WAIT', timeout: 700 }, () => {
      conn.setDBOptions(
        { database, optionsObj: optionsObj },
        (data, response) => {
          expect(response.statusCode).toEqual(200);

          done();
        }
      );
    });
  });
});
