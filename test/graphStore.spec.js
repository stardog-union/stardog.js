/* eslint-env jest */

const graph = require('../lib/db/graph');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
  addTestData,
} = require('./setup-database');

describe('graph store protocol', () => {
  const database = generateDatabaseName();
  const makeGraph = name => `http://example.org/namedgraphs#${name}`;
  let conn;

  beforeAll(() =>
    seedDatabase(database)().then(() =>
      addTestData(database, 'fixtures/ng_tests.trig', 'application/trig')
    )
  );
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  describe('graph.doGet', () => {
    it('should retrieve named graphs', () =>
      graph.doGet(conn, database, makeGraph('bob')).then(res => {
        expect(res.body).toContain('bob@oldcorp.example.org');
      }));

    it('should retrieve the default graph when no graph is specified', () =>
      graph
        .doGet(conn, database)
        .then(res => {
          expect(res.body).toContain(
            'http://purl.org/dc/elements/1.1/publisher'
          );
          return graph.doGet(conn, database, null);
        })
        .then(res => {
          expect(res.body).toContain(
            'http://purl.org/dc/elements/1.1/publisher'
          );
        }));

    it('should retrieve other RDF serializations when specified', () =>
      graph.doGet(conn, database, null, 'application/rdf+xml').then(res => {
        expect(res.body).toContain(
          '<publisher xmlns="http://purl.org/dc/elements/1.1/"'
        );
      }));
  });

  describe('graph.doPut', () => {
    it('should create a new graph', () =>
      graph
        .doPut(
          conn,
          database,
          '@prefix : <http://example.org/namedgraphs#> . :ed a :Person .',
          makeGraph('ed'),
          'text/turtle'
        )
        .then(res => {
          expect(res.status).toBe(201);
        }));
    it('should overwrite an existing graph', () =>
      graph
        .doPut(
          conn,
          database,
          '_:b <http://xmlns.com/foaf/0.1/mbox> <mailto:alice@work.newexample.org> .',
          makeGraph('alice'),
          'text/turtle'
        )
        .then(res => {
          expect(res.status).toBe(200);
          return graph.doGet(conn, database, makeGraph('alice'));
        })
        .then(res => {
          expect(res.body).not.toContain('mailto:alice@work.example.org');
          expect(res.body).toContain('mailto:alice@work.newexample.org');
        }));
  });

  describe('graph.doPost', () => {
    it('should create a new graph', () =>
      graph
        .doPost(
          conn,
          database,
          '@prefix : <http://example.org/namedgraphs#> . :ed a :Person .',
          makeGraph('ed'),
          'text/turtle'
        )
        .then(res => {
          expect(res.status).toBe(200);
        }));
    it('should merge into an existing graph', () =>
      graph
        .doPost(
          conn,
          database,
          '_:b <http://xmlns.com/foaf/0.1/mbox> <mailto:bob@newcorp.example.org> .',
          makeGraph('bob'),
          'text/turtle'
        )
        .then(res => {
          expect(res.status).toBe(200);
          return graph.doGet(conn, database, makeGraph('bob'));
        })
        .then(res => {
          expect(res.body).toContain('bob@oldcorp.example.org');
          expect(res.body).toContain('bob@newcorp.example.org');
        }));
  });

  describe('graph.doDelete', () => {
    it('should delete a graph', () =>
      graph
        .doDelete(conn, database, makeGraph('alice'))
        .then(res => {
          expect(res.status).toBe(200);
          return graph.doGet(conn, database, makeGraph('alice'));
        })
        .then(res => {
          expect(res.body).toBe('[ ]');
        }));
  });
});
