const Path = require('path');
const RandomString = require('randomstring');
const Stardog = require('../lib/index2');
const dbs = new Set(); // used to keep track of DBs across runs

exports.seedDatabase = database => () => {
  const conn = new Stardog.Connection({
    username: 'admin',
    password: 'admin',
    endpoint: 'http://localhost:5820',
  });

  return conn
    .createDB(
      database,
      {
        index: {
          type: 'disk',
        },
        search: {
          enabled: true,
        },
      },
      {
        // Load everything into the DB
        files: [
          {
            filename: Path.resolve(__dirname, 'fixtures', 'api_tests.nt'),
          },
          {
            filename: Path.resolve(
              __dirname,
              'fixtures',
              'reasoning',
              'abox.ttl'
            ),
          },
          {
            filename: Path.resolve(
              __dirname,
              'fixtures',
              'reasoning',
              'tbox.ttl'
            ),
          },
        ],
      }
    )
    .then(res => {
      expect(res.status).toBe(201);
    });
};

exports.dropDatabase = database => () => {
  const conn = new Stardog.Connection({
    username: 'admin',
    password: 'admin',
    endpoint: 'http://localhost:5820',
  });
  return conn.dropDB(database).then(res => {
    expect(response.status).toBe(200);
  });
};

exports.generateDatabaseName = () => {
  const database =
    'stardogjs-' +
    RandomString.generate({
      length: 25,
      charset: 'alphabetic',
    });
  dbs.add(database);
  return database;
};

exports.generateRandomString = () => {
  return RandomString.generate({
    length: 10,
    charset: 'alphabetic',
  });
};
