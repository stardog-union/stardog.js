/* eslint-env jest */

const Path = require('path');
const fs = require('fs');
const RandomString = require('randomstring');
const { Connection, db } = require('../lib');

const dbs = new Set(); // used to keep track of DBs across runs
const basePath = process.env.CIRCLECI ? '/var/opt/stardog/test/' : __dirname;

exports.seedDatabase = database => () => {
  const conn = exports.ConnectionFactory();

  return db
    .create(
      conn,
      database,
      {
        index: {
          type: 'disk',
        },
        search: {
          enabled: true,
        },
        icv: {
          enabled: true,
        },
      },
      {
        // Load everything into the DB
        files: [
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

exports.addTestData = (database, path, contentType) => {
  const conn = exports.ConnectionFactory();
  return db.transaction.begin(conn, database).then(txRes =>
    Promise.resolve(
      fs.readFileSync(Path.resolve(basePath, path), 'utf-8')
    ).then(content =>
      db
        .add(conn, database, txRes.transactionId, content, { contentType })
        .then(res => {
          expect(res.status).toBe(200);
          return db.transaction.commit(conn, database, txRes.transactionId);
        })
        .then(res => {
          expect(res.status).toBe(200);
        })
    )
  );
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
