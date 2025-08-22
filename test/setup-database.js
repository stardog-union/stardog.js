/* eslint-env jest */

const path = require('path');
const fs = require('fs');
const RandomString = require('randomstring');
const { Connection, db } = require('../lib');

const dbs = new Set(); // used to keep track of DBs across runs
const host = process.env.HOST || 'localhost';

exports.seedDatabase =
  (database, options = {}, addlFiles = []) =>
  () => {
    const conn = exports.ConnectionFactory();

    const filePaths = [
      ...addlFiles,
      'fixtures/api_tests.nt',
      'fixtures/reasoning/abox.ttl',
      'fixtures/reasoning/tbox.ttl',
      'fixtures/issues/data.ttl',
      'fixtures/issues/schema.ttl',
      'fixtures/paths.ttl',
    ].map(relPath => path.resolve(__dirname, relPath));

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
        })
      )
      .then(createResponse => {
        expect(createResponse.ok).toBe(true);
        expect(createResponse.status).toBe(201);
        expect(createResponse.body.message || '').not.toContain('Error');

        let f = Promise.resolve();
        filePaths.forEach(filePath => {
          const data = fs.readFileSync(filePath, 'utf8');

          f = f.then(() =>
            db.namespaces.add(conn, database, data).then(namespacesResponse => {
              expect(namespacesResponse.ok).toBe(true);
              expect(namespacesResponse.status).toBe(200);
            })
          );
        });

        return f;
      })
      .then(() => db.transaction.begin(conn, database))
      .then(transactionResponse => {
        expect(transactionResponse.ok).toBe(true);
        expect(transactionResponse.status).toBe(200);

        const { transactionId } = transactionResponse;

        let f = Promise.resolve();
        filePaths.forEach(filePath => {
          const data = fs.readFileSync(filePath, 'utf8');

          f = f.then(() =>
            db
              .add(conn, database, transactionId, data, {
                // TODO
                contentType: 'text/turtle',
              })
              .then(addResponse => {
                expect(addResponse.ok).toBe(true);
                expect(addResponse.status).toBe(200);
              })
          );
        });

        return f.then(() =>
          db.transaction.commit(conn, database, transactionId)
        );
      })
      .then(commitResponse => {
        expect(commitResponse.ok).toBe(true);
        expect(commitResponse.status).toBe(200);
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

exports.generateProviderIri = () =>
  `stardogjs:provider:${RandomString.generate({
    length: 25,
    charset: 'alphabetic',
  })}`;

exports.createAddProviderQuery = providerIri => `\
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
exports.createValidateProviderQuery = providerIri => `\
select * where {
  graph <tag:stardog:api:catalog:providers>
  {
    <${providerIri}> ?p ?o .
  }
}`;
exports.createClearProviderQuery = providerIri => `\
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
