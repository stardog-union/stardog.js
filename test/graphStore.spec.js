/* eslint-env jest */

const { graph } = require('../lib/db');
const {
  seedDatabase,
  dropDatabase,
  generateDatabaseName,
  ConnectionFactory,
} = require('./setup-database');

describe('graph store protocol', () => {
  const database = generateDatabaseName();
  const makeGraph = name => `http://example.org/namedgraphs#${name}`;
  let conn;

  beforeAll(seedDatabase(database, {}, ['fixtures/ng_tests.trig']));
  afterAll(dropDatabase(database));

  beforeEach(() => {
    conn = ConnectionFactory();
  });

  describe('graph.doGet', () => {
    it('should retrieve named graphs', () =>
      graph.doGet(conn, database, makeGraph('bob')).then(res => {
        expect(res.body).toMatchSnapshot();
      }));

    it('should retrieve the default graph when no graph is specified', () =>
      graph
        .doGet(conn, database)
        .then(res => {
          expect(res.body).toMatchSnapshot();
          return graph.doGet(conn, database, null);
        })
        .then(res => {
          expect(res.body).toMatchSnapshot();
        }));

    it('should retrieve other RDF serializations when specified', () =>
      graph.doGet(conn, database, null, 'application/rdf+xml').then(res => {
        expect(res.body).toContain('<rdf:RDF');
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
          expect(res.body).toMatchSnapshot();
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
          expect(res.body).toMatchSnapshot();
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
          expect(res.body['@graph']).toHaveLength(0);
        }));
  });
});
