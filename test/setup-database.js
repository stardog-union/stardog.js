const Path = require('path');
const RandomString = require('randomstring');
const Stardog = require('../lib');
const dbs = new Set(); // used to keep track of DBs across runs

exports.seedDatabase = database => done => {
  const conn = new Stardog.Connection();
  conn.setEndpoint('http://localhost:5820/');
  conn.setCredentials('admin', 'admin');
  conn.createDB(
    {
      database,
      options: {
        'index.type': 'disk',
        'search.enabled': true,
      },
      // Load everything into the DB
      files: [
        {
          filename: Path.resolve(
            '/var/opt/stardog/test/',
            'fixtures',
            'api_tests.nt'
          ),
        },
        {
          filename: Path.resolve(
            '/var/opt/stardog/test/',
            'fixtures',
            'reasoning',
            'abox.ttl'
          ),
        },
        {
          filename: Path.resolve(
            '/var/opt/stardog/test/',
            'fixtures',
            'reasoning',
            'tbox.ttl'
          ),
        },
      ],
    },
    (data, response) => {
      expect(response).toBe(201);
      done();
    }
  );
};

exports.dropDatabase = database => done => {
  const conn = new Stardog.Connection();
  conn.setEndpoint('http://localhost:5820/');
  conn.setCredentials('admin', 'admin');
  conn.dropDB({ database }, (data, response) => {
    expect(response.statusCode).toBe(200);
    done();
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
