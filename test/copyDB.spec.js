const Stardog = require('../lib');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
} = require('./setup-database');

describe('copyDB()', () => {
  const sourceDatabase = generateDatabaseName();
  const destinationDatabase = generateDatabaseName();
  let conn;

  beforeAll(seedDatabase(sourceDatabase));
  afterAll(dropDatabase(sourceDatabase));
  afterAll(dropDatabase(destinationDatabase));

  beforeEach(() => {
    conn = new Stardog.Connection();
    conn.setEndpoint('http://localhost:5820/');
    conn.setCredentials('admin', 'admin');
  });

  it('should not copy an online DB', done => {
    conn.onlineDB(
      { dbsource: sourceDatabase, strategy: 'WAIT', timeout: 3 },
      () => {
        conn.copyDB(
          { dbsource: sourceDatabase, dbtarget: destinationDatabase },
          () => {
            conn.listDBs((data, res) => {
              expect(res.statusCode).toEqual(200); // Not sure why this is a 200, but it is
              expect(data.databases).not.toContain(destinationDatabase);
              expect(data.databases).toContain(sourceDatabase);
              done();
            });
          }
        );
      }
    );
  });

  it('should copy an offline DB', done => {
    conn.offlineDB(
      { database: sourceDatabase, strategy: 'WAIT', timeout: 3 },
      () => {
        // Once the DB is offline, copy it.
        conn.copyDB(
          { dbsource: sourceDatabase, dbtarget: destinationDatabase },
          () => {
            conn.listDBs((data, res) => {
              expect(res.statusCode).toEqual(200);
              expect(data.databases).toEqual(
                expect.arrayContaining([sourceDatabase, destinationDatabase])
              );
              done();
            });
          }
        );
      }
    );
  });
});
