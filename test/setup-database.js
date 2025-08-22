/* eslint-env jest */

const Path = require('path');
const RandomString = require('randomstring');
const { Connection, db } = require('../lib');

const dbs = new Set(); // used to keep track of DBs across runs
const basePath = process.env.CIRCLECI ? '/var/opt/stardog/test/' : __dirname;
const host = process.env.HOST || 'localhost';

exports.seedDatabase =
  (database, options = {}, addlFiles = []) =>
  () => {
    const conn = exports.ConnectionFactory();

    return db
      .create(
        conn,
        database,
        Object.assign(options, {
          index: {
            type: 'disk',
          },
          // override new default value in v10.0.0+ since tests were mostly written before then
          reasoning: {
            schema: {
              graphs: 'tag:stardog:api:context:local',
            },
          },
        }),
        {
          // Load everything into the DB
          files: [
            ...addlFiles.map((relPath) => ({
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
              filename: Path.resolve(
                basePath,
                'fixtures',
                'issues',
                'data.ttl'
              ),
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
      .then((res) => {
        expect(res.status).toBe(201);
      });
  };

exports.dropDatabase = (database) => () => {
  const conn = exports.ConnectionFactory();
  return db.drop(conn, database).then((res) => {
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

exports.generateProviderIri = () =>
  `stardogjs:provider:${RandomString.generate({
    length: 25,
    charset: 'alphabetic',
  })}`;

exports.createAddProviderQuery = (providerIri) => `\
insert data {
  graph <tag:stardog:api:catalog:providers>
  {
    <${providerIri}> a <tag:stardog:api:catalog:JdbcProvider> ;
      <tag:stardog:api:catalog:provider:accessKey> "FAKE-ACCESS-KEY" ;
      rdfs:label "Stardog.js test provider" ;
      <tag:stardog:api:catalog:provider:serverAddress> "jdbc:mysql://localhost:3306" ;
      <tag:stardog:api:catalog:provider:schedule> "0 0 0 1 0 ?" .
  }
}`;
exports.createValidateProviderQuery = (providerIri) => `\
select * where {
  graph <tag:stardog:api:catalog:providers>
  {
    <${providerIri}> ?p ?o .
  }
}`;
exports.createClearProviderQuery = (providerIri) => `\
delete where {
  graph <tag:stardog:api:catalog:providers>
  {
    <${providerIri}> ?p ?o .
  }
}
`;

exports.generateRandomString = () =>
  RandomString.generate({
    length: 10,
    charset: 'alphabetic',
  });

exports.ConnectionFactory = (port = 5820) =>
  new Connection({
    username: 'admin',
    password: 'admin',
    endpoint: `http://${host}:${port}`,
  });
