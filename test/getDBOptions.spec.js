const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  generateRandomString,
} = require('./setup-database');

describe('getDBOptions()', () => {
  const database = generateDatabaseName();
  var conn;

  beforeAll(seedDatabase(database));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should get NOT_FOUND status code trying to get the options of a non-existent DB.', done => {
    var optionsObj = {
      'search.enabled': '',
      'icv.enabled': '',
    };

    conn.onlineDB({ database: 'nodeDB_test' }, (dataOnline, responseOnline) => {
      expect(responseOnline.statusCode).toEqual(404);
      conn.getDBOptions(
        { database: 'nodeDB_test', optionsObj: optionsObj },
        (data, response) => {
          expect(response.statusCode).toEqual(500);
          done();
        }
      );
    });
  });

  it('should get the options of an DB', done => {
    var optionsObj = {
      'search.enabled': '',
      'icv.enabled': '',
    };

    conn.getDBOptions(
      { database, optionsObj: optionsObj },
      (data, respose2) => {
        expect(respose2.statusCode).toEqual(200);
        expect(data).toEqual({
          'search.enabled': true,
          'icv.enabled': false,
        });
        done();
      }
    );
  });
});
