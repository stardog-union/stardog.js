/* eslint-env jest */

const Path = require('path');
const RandomString = require('randomstring');
const { Connection, db } = require('../lib');

const dbs = new Set(); // used to keep track of DBs across runs
const basePath = process.env.CIRCLECI ? '/var/opt/stardog/test/' : __dirname;

exports.seedDatabase = (database, options = {}, addlFiles = []) => () => {
  const conn = exports.ConnectionFactory();

  return db
    .create(
      conn,
      database,
      Object.assign(options, {
        index: {
          type: 'disk',
        },
      }),
      {
        // Load everything into the DB
        files: [
          ...addlFiles.map(relPath => ({
            filename: Path.resolve(basePath, relPath),
          })),
          {
            filename: Path.resolve(basePath, 'fixtures', 'api_tests.nt'),
          },
          {
            filename: Path.resolve(
              basePath,
              'fixtures',
              'reasoning',
              'abox.ttl'
            ),
          },
          {
            filename: Path.resolve(
              basePath,
              'fixtures',
              'reasoning',
              'tbox.ttl'
            ),
          },
          {
            filename: Path.resolve(basePath, 'fixtures', 'issues', 'data.ttl'),
          },
          {
            filename: Path.resolve(
              basePath,
              'fixtures',
              'issues',
              'schema.ttl'
            ),
          },
          {
            filename: Path.resolve(basePath, 'fixtures', 'paths.ttl'),
          },
        ],
      }
    )
    .then(res => {
      expect(res.status).toBe(201);
    });
};

exports.dropDatabase = database => () => {
  const conn = exports.ConnectionFactory();
  return db.drop(conn, database).then(res => {
    expect(res.status).toBe(200);
  });
};

exports.generateDatabaseName = () => {
  const database = `stardogjs-${RandomString.generate({
    length: 25,
    charset: 'alphabetic',
  })}`;
  dbs.add(database);
  return database;
};

exports.generateRandomString = () =>
  RandomString.generate({
    length: 10,
    charset: 'alphabetic',
  });

exports.ConnectionFactory = () =>
  new Connection({
    username: 'admin',
    password: 'admin',
    endpoint: 'http://localhost:5820',
    // endpoint: 'http://localhost:61941',
  });
